package jetbrains.buildServer.notification.tray.model;

/**
 * Build message.
 */
public class BuildNotification implements Notification {

    public BuildData build = new BuildData();
    private final String type = "build";

    public BuildNotification() {
    }

    public BuildNotification(final BuildData build) {
        this.build = build;
    }

    @Override
    public String getType() {
        return type;
    }
}
