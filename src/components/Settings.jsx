import useStore from "../store";
import { Modal, Stack, Group, Text, Switch, Kbd, Button } from "@mantine/core";
import { convertDuration } from "../utils/time";
import useSwitchStore from "../switch/store";
import { openShortcutSettings } from "../utils/keys";
import {
  COMMANDS as TAB_COMMANDS,
  OPEN_SWITCH_COMMAND,
} from "../switch/catalog";
import { KeyLabel } from "../switch/components/common";

// Open first, then the tab commands, labelled with their manifest.json
// descriptions (Chrome doesn't keep the manifest's key order)
const { commands = {} } = chrome.runtime.getManifest();
const COMMANDS = [OPEN_SWITCH_COMMAND, ...TAB_COMMANDS.map(({ id }) => id)].map(
  (name) => [name, commands[name]],
);

const SwitchShortcuts = () => {
  const commandKeys = useSwitchStore((state) => state.commandKeys);
  const anyUnassigned = COMMANDS.some(
    ([name]) => commandKeys[name]?.length === 0,
  );

  return (
    <>
      <Group justify="space-between" align="center" mt="xl">
        <Text size="xs" c="dimmed" className="font-mono tracking-wider">
          SWITCH
        </Text>
        <Button
          size="compact-xs"
          variant="subtle"
          color="blue"
          onClick={openShortcutSettings}
        >
          Change keys
        </Button>
      </Group>
      <Stack gap={0}>
        {COMMANDS.map(([name, { description }]) => (
          <Group
            key={name}
            justify="space-between"
            className="py-2.5 border-b last:border-b-0 border-(--mantine-color-default-border)"
          >
            <Text size="sm">{description}</Text>
            {commandKeys[name]?.length ? (
              <Group gap={4}>
                {commandKeys[name].map((key) => (
                  <Kbd key={key} size="xs" className="font-mono!">
                    <KeyLabel label={key} />
                  </Kbd>
                ))}
              </Group>
            ) : (
              <Text size="sm" c="dimmed">
                {commandKeys[name] ? "Not set" : ""}
              </Text>
            )}
          </Group>
        ))}
      </Stack>
      {anyUnassigned && (
        <Text size="sm" c="yellow" mt="sm">
          Keys marked “Not set” are taken by another extension, often the old
          QuickSwitch extension. Pick new ones with Change keys.
        </Text>
      )}
    </>
  );
};

const Settings = () => {
  const { showSettingsDialog, toggleSettingsDialog, entities, setEntities } =
    useStore();

  const updateEntity = (id, updatedFields) => {
    const updatedEntities = entities.map((entity) =>
      entity._id === id ? { ...entity, ...updatedFields } : entity,
    );
    setEntities(updatedEntities);
  };

  return (
    <Modal
      opened={showSettingsDialog}
      onClose={toggleSettingsDialog}
      title="Settings"
      centered
      size={"lg"}
      overlayProps={{
        backgroundOpacity: 0.55,
        blur: 3,
      }}
    >
      <Text size="xs" c="dimmed" className="font-mono tracking-wider">
        SOURCES
      </Text>
      <Stack gap={0}>
        {entities.map((entity) => (
          <div
            className="py-3 border-b last:border-b-0 border-(--mantine-color-default-border)"
            key={entity._id}
          >
            <Group justify="space-between" align="start">
              <div className="flex flex-col">
                <Text fw={500}>{entity.label}</Text>
                <Text size="sm" c="dimmed">
                  {entity.description}
                </Text>
                <Text size="sm" c="dimmed">
                  Refreshes every {convertDuration(entity.refreshDuration)}.
                </Text>
                {/* <Text size="sm" c="dimmed">
                  Fetched {entity.history.length} items.
                </Text> */}
              </div>
              <Switch
                color="blue"
                checked={entity.enabled}
                onChange={(event) =>
                  updateEntity(entity._id, {
                    enabled: event.currentTarget.checked,
                  })
                }
              />
            </Group>
            {/* <Text size="sm" c="dimmed">
              With Fjord Tours you can explore more of the magical fjord
              landscapes with tours and activities on and around the fjords of
              Norway
            </Text> */}
          </div>
        ))}
      </Stack>
      <SwitchShortcuts />
      {/* <Button onClick={toggleSettingsDialog}>Close</Button> */}
    </Modal>
  );
};

export default Settings;
