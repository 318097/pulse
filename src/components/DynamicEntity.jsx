import React, { useState } from "react";
import { Group, Loader, Text, ActionIcon, Badge } from "@mantine/core";
import { useDynamicEntity } from "../hooks/useDynamicEntity";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import {
  CaretLeftIcon,
  CaretRightIcon,
  WarningOctagonIcon,
} from "@phosphor-icons/react";

dayjs.extend(relativeTime);

const iconProps = {
  size: "xs",
  variant: "transparent",
};

const Loading = ({ align = "center", entity, size = "sm" }) => (
  <Group justify={align} gap="xs">
    <Loader size={size} color="yellow" />
    <Text size={size}>Loading {entity?.label || "content"}.</Text>
  </Group>
);

export default function DynamicEntity({ entity, onError, onUpdate }) {
  const { refreshDuration, history = [], label, db } = entity || {};
  const { data, loading, error, refetch } = useDynamicEntity(entity, onUpdate);
  const historyLength = history?.length || 0;
  const defaultHistoryIdx = historyLength > 0 ? historyLength - 1 : null;
  const [historyIdx, setHistoryIdx] = useState(defaultHistoryIdx);

  const lastUpdatedAt = db?.apiParams?.lastUpdatedAt;
  const nextResetAt =
    refreshDuration && lastUpdatedAt
      ? dayjs(lastUpdatedAt).add(refreshDuration, "second").toISOString()
      : null;

  React.useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

  React.useEffect(() => {
    setHistoryIdx(defaultHistoryIdx); // reset history index whenever entity changes
  }, [entity._id, historyLength, defaultHistoryIdx]);

  const handleHistoryNavigation = (direction) => {
    if (historyLength === 0) return;

    const currentIndex = historyIdx !== null ? historyIdx : historyLength - 1;
    let newIndex;
    if (direction === "prev") {
      newIndex = Math.max(currentIndex - 1, 0);
    } else {
      newIndex = Math.min(currentIndex + 1, historyLength - 1);
    }
    setHistoryIdx(newIndex);
  };

  const finalData =
    historyIdx !== null ? history?.[historyIdx]?.html || data : data;

  if (loading && !data) return <Loading entity={entity} />;

  return (
    <div className="flex flex-col justify-start items-stretch gap-4 rounded p-8 w-full dark:bg-black/10 backdrop-blur-md shadow-xl">
      <Badge variant="light" color="blue" size="sm" radius="sm">
        {label}
      </Badge>
      <div
        className="content-card"
        dangerouslySetInnerHTML={{
          __html: finalData,
        }}
      />
      <div className="flex items-center justify-between flex-row-reverse">
        {error ? (
          <div className="text-xs italic flex items-center">
            <ActionIcon {...iconProps} size="sm" color="red">
              <WarningOctagonIcon />
            </ActionIcon>
            {error ? `${error}.` : `Failed to fetch ${label || "entity"}.`}
          </div>
        ) : loading ? (
          <Loading entity={entity} align="start" size="xs" />
        ) : nextResetAt ? (
          <div className="text-xs italic">
            Next refresh {dayjs(nextResetAt).fromNow()}.
          </div>
        ) : null}
        {historyLength > 1 && (
          <div className="flex items-center gap-1">
            {historyIdx > 0 && (
              <ActionIcon
                {...iconProps}
                onClick={() => handleHistoryNavigation("prev")}
              >
                <CaretLeftIcon />
              </ActionIcon>
            )}
            {historyIdx < historyLength - 1 && (
              <ActionIcon
                {...iconProps}
                onClick={() => handleHistoryNavigation("next")}
              >
                <CaretRightIcon />
              </ActionIcon>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
