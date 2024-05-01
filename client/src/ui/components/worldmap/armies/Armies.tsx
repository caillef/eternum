import { getComponentValue } from "@dojoengine/recs";
import { useDojo } from "../../../../hooks/context/DojoContext";
import { useCombat } from "../../../../hooks/helpers/useCombat";
import useRealmStore from "../../../../hooks/store/useRealmStore";
import useUIStore from "../../../../hooks/store/useUIStore";
import { getEntityIdFromKeys, getUIPositionFromColRow } from "../../../utils/utils";
import { Position, UIPosition } from "@bibliothecadao/eternum";
// @ts-ignore
import { useEffect, useMemo, useState } from "react";
import { Subscription } from "rxjs";
import { Army } from "./Army";
import { getRealmOrderNameById } from "../../../utils/realms";

type ArmiesProps = {
  props?: any;
};

export const Armies = ({}: ArmiesProps) => {
  const {
    account: { account },
    setup: {
      components: { Position, Owner, Health },
    },
  } = useDojo();

  const realms = useRealmStore((state) => state.realmEntityIds);

  const { useOwnerArmies } = useCombat();

  const myArmies = useOwnerArmies(BigInt(account.address));

  // set animation path for enemies
  useUpdateAnimationPaths();

  const realmOrder = useMemo(() => {
    const realmId = realms[0]?.realmId || BigInt(0);
    const orderName = getRealmOrderNameById(realmId);
    return orderName.charAt(0).toUpperCase() + orderName.slice(1);
  }, []);

  console.log("ownerArmies", myArmies);
  const armyInfo = useMemo(
    () =>
      [...myArmies]
        .map((armyId) => {
          const position = getComponentValue(Position, getEntityIdFromKeys([armyId?.entity_id || 0n]));
          const health = getComponentValue(Health, getEntityIdFromKeys([armyId?.entity_id || 0n]));
          // const isDead = health?.current ? false : true;

          console.log({ health });
          const isDead = false;
          const owner = getComponentValue(Owner, getEntityIdFromKeys([armyId?.entity_id || 0n]));
          const isMine = owner?.address === BigInt(account.address);

          // // if animated army dont display
          if (!position) return;
          let z = 0.32;

          return {
            contractPos: { x: position.x, y: position.y },
            uiPos: { ...getUIPositionFromColRow(position.x, position.y), z: z },
            id: position.entity_id,
            isDead,
            isMine,
          };
        })
        .filter(Boolean) as {
        contractPos: Position;
        uiPos: UIPosition;
        id: bigint;
        isDead: boolean;
        isMine: boolean;
      }[],
    [myArmies],
  );

  console.log({ armyInfo });

  return (
    <group>
      {armyInfo.map((info) => {
        const key = `${info.contractPos.x},${info.contractPos.y}`;
        // Find the index of this army within its own group
        const index = Number(info.id) % 12;
        const offset = calculateOffset(index, 12);
        // add random offset to avoid overlapping
        offset.y += Math.random() * 1 - 0.5;

        return (
          <Army
            key={info.id}
            info={{
              ...info,
              order: realmOrder,
            }}
            offset={offset}
          />
        );
      })}
    </group>
  );
};

const calculateOffset = (index: number, total: number) => {
  if (total === 1) return { x: 0, y: 0 };

  const radius = 1.5; // Radius where the armies will be placed
  const angleIncrement = (2 * Math.PI) / 6; // Maximum 6 points on the circumference for the first layer
  let angle = angleIncrement * (index % 6);
  let offsetRadius = radius;

  if (index >= 6) {
    // Adjustments for more than 6 armies, placing them in another layer
    offsetRadius += 0.5; // Increase radius for each new layer
    angle += angleIncrement / 2; // Offset angle to interleave with previous layer
  }

  return {
    x: offsetRadius * Math.cos(angle),
    y: offsetRadius * Math.sin(angle),
  };
};

const useUpdateAnimationPaths = () => {
  const {
    account: { account },
    setup: {
      updates: {
        eventUpdates: { createTravelHexEvents },
      },
    },
  } = useDojo();

  const realmEntityIds = useRealmStore((state) => state.realmEntityIds);
  const setAnimationPaths = useUIStore((state) => state.setAnimationPaths);
  const animationPaths = useUIStore((state) => state.animationPaths);

  useEffect(() => {
    let subscription: Subscription | undefined;

    const subscribeToTravelEvents = async () => {
      const observable = await createTravelHexEvents();
      const sub = observable.subscribe((event) => {
        if (event) {
          const path = [];
          const owner = BigInt(event.keys[3]);
          const enemy = owner !== BigInt(account.address);
          // if my army, then set animation directly when firing tx
          if (!enemy) return;
          const id = BigInt(event.data[0]);
          const len = Number(event.data[2]);
          for (let i = 3; i < 3 + len * 2; i += 2) {
            const pos = { x: Number(event.data[i]), y: Number(event.data[i + 1]) };
            path.push(pos);
          }
          setAnimationPaths([...animationPaths, { id, path, enemy }]);
        }
      });
      subscription = sub;
    };
    subscribeToTravelEvents();

    return () => {
      subscription?.unsubscribe();
    };
  }, []);
};