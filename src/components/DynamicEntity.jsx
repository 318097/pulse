import { useState, useEffect } from "react";
import {
  Group,
  Loader,
  Text,
  ActionIcon,
  Paper,
  Divider,
} from "@mantine/core";
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

// link-preview og:image/favicon URLs come from third-party pages and can 404;
// drop broken ones so the card collapses instead of showing a broken-image icon
const removeBrokenImage = (event) => {
  if (event.target.tagName === "IMG") event.target.remove();
};

// a callback ref (not an effect) so the listener follows the content node when the
// card remounts after loading; error doesn't bubble, hence the capture phase
const watchBrokenImages = (node) => {
  node?.addEventListener("error", removeBrokenImage, true);
};

const Loading = ({ align = "center", entity, size = "sm" }) => (
  <Group justify={align} gap="xs">
    <Loader size={size} color="yellow" />
    <Text size={size} className="font-mono">
      Loading {entity?.label || "content"}.
    </Text>
  </Group>
);

export default function DynamicEntity({ entity, onError, onUpdate }) {
  const { refreshDuration, history = [], label, db } = entity || {};
  const { data, loading, error } = useDynamicEntity(entity, onUpdate);
  const historyLength = history?.length || 0;
  const defaultHistoryIdx = historyLength > 0 ? historyLength - 1 : null;
  const [historyIdx, setHistoryIdx] = useState(defaultHistoryIdx);

  // reset history index whenever entity changes; adjusting state during render
  // avoids the extra render a useEffect reset would cause
  const historyKey = `${entity._id}:${historyLength}`;
  const [prevHistoryKey, setPrevHistoryKey] = useState(historyKey);
  if (historyKey !== prevHistoryKey) {
    setPrevHistoryKey(historyKey);
    setHistoryIdx(defaultHistoryIdx);
  }

  const lastUpdatedAt = db?.apiParams?.lastUpdatedAt;
  const nextResetAt =
    refreshDuration && lastUpdatedAt
      ? dayjs(lastUpdatedAt).add(refreshDuration, "second").toISOString()
      : null;

  useEffect(() => {
    if (error && onError) {
      onError(error);
    }
  }, [error, onError]);

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
    <Paper
      className="w-full bg-[#232428] shadow-pulse-card"
      withBorder
      radius="md"
      p="xl"
    >
      <div
        ref={watchBrokenImages}
        className={`content-card ${entity._id}`}
        dangerouslySetInnerHTML={{
          __html: finalData,
        }}
      />
      <Divider className="my-6" />
      <div className="flex items-center justify-between flex-row-reverse">
        {error ? (
          <div className="text-xs font-mono flex items-center">
            <ActionIcon {...iconProps} size="sm" color="red">
              <WarningOctagonIcon />
            </ActionIcon>
            {error ? `${error}.` : `Failed to fetch ${label || "entity"}.`}
          </div>
        ) : loading ? (
          <Loading entity={entity} align="start" size="xs" />
        ) : nextResetAt ? (
          <div className="text-xs font-mono">
            Next reset {dayjs(nextResetAt).fromNow()}.
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
    </Paper>
  );
}
