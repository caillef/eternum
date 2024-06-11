import { useEffect, useMemo, useState } from "react";
import { SortButton, SortInterface } from "../../../elements/SortButton";
import { SortPanel } from "../../../elements/SortPanel";
import { OrderIcon } from "../../../elements/OrderIcon";
import useUIStore from "../../../../hooks/store/useUIStore";
import useLeaderBoardStore, { GuildPointsLeaderboardInterface } from "../../../../hooks/store/useLeaderBoardStore";
import Button from "../../../elements/Button";
import { currencyIntlFormat, sortItems } from "../../../utils/utils";

type GuildPointsLeaderboardKeys = keyof GuildPointsLeaderboardInterface;

interface SortingParamGuildPointsLeaderboard {
  label: string;
  sortKey: GuildPointsLeaderboardKeys;
  className?: string;
}

export const GuildsLeaderboard = () => {
  const [loading, _] = useState(false);
  const [activeSort, setActiveSort] = useState<SortInterface>({
    sortKey: "number",
    sort: "none",
  });

  const guildPointsLeaderboard = useLeaderBoardStore((state) => state.guildPointsLeaderboard);

  const setTooltip = useUIStore((state) => state.setTooltip);

  const sortingParams: SortingParamGuildPointsLeaderboard[] = useMemo(() => {
    return [
      { label: "Rank", sortKey: "rank", className: "col-span-1" },
      { label: "Name", sortKey: "name", className: "col-span-2" },
      { label: "Points", sortKey: "totalPoints", className: "col-span-1" },
    ];
  }, []);

  useEffect(() => {}, [loading]);

  return (
    <div className="flex flex-col">
      <SortPanel className="px-3 py-2 grid grid-cols-4 gap-4">
        {sortingParams.map(({ label, sortKey, className }) => (
          <SortButton
            className={className}
            key={sortKey}
            label={label}
            sortKey={sortKey}
            activeSort={activeSort}
            onChange={(_sortKey, _sort) => {
              setActiveSort({
                sortKey: _sortKey,
                sort: _sort,
              });
            }}
          />
        ))}
      </SortPanel>
      {!loading && (
        <div className="flex flex-col p-3 space-y-2 overflow-y-auto">
          {sortItems(guildPointsLeaderboard, activeSort).map(({ name, totalPoints, isYours, rank }) => {
            return (
              <div
                key={rank}
                className={`grid grid-cols-4 gap-4 clip-angled-sm p-1 ${
                  isYours ? "bg-green/20" : ""
                }  text-xxs text-gold`}
              >
                <div className="col-span-1">{`#${rank}`}</div>
                <div className="col-span-2">{name}</div>
                <div className="col-span-1"> {currencyIntlFormat(totalPoints, 0)}</div>
              </div>
            );
          })}
        </div>
      )}
      {loading && (
        <div className="flex justify-center items-center min-h-[50px]">
          (
          <Button isLoading={true} onClick={() => {}} variant="danger" className="p-2 !h-4 text-xxs !rounded-md">
            {" "}
            {}{" "}
          </Button>
          )
        </div>
      )}
    </div>
  );
};