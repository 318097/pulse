import useStore from "../store";
import { Modal, Card, Stack, Group, Text, Switch } from "@mantine/core";

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
      <Stack>
        {entities.map((entity) => (
          <Card shadow="sm" padding="xs" withBorder key={entity._id}>
            <Group justify="space-between" align="center">
              <div className="flex flex-col">
                <Text fw={500}>{entity.label}</Text>
                <Text size="sm" c="dimmed">
                  {entity.description}
                </Text>
                {/* <Text size="sm" c="dimmed">
                  Fetched {entity.history.length} items.
                </Text> */}
              </div>
              <Switch
                // color="teal"
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
          </Card>
        ))}
      </Stack>
      {/* <Button onClick={toggleSettingsDialog}>Close</Button> */}
    </Modal>
  );
};

export default Settings;
