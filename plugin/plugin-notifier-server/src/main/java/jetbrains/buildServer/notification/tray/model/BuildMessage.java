package jetbrains.buildServer.notification.tray.model;

/**
 * Build message.
 */
public class BuildMessage implements Message {

    private String myMessage;

    public BuildMessage() {
    }

    public BuildMessage(final String message) {
        myMessage = message;
    }

    @Override
    public String getMessage() {
        return null;
    }

    public void setMessage(final String message) {
        myMessage = message;
    }
}
