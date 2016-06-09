package jetbrains.buildServer.notification.tray.model;

/**
 * @author Dmitry.Tretyakov
 *         Date: 6/9/2016
 *         Time: 7:00 PM
 */
public class BuildData {
    public String status;
    public String buildNumber;
    public String buildName;
    public String agentName;
    public Boolean personal;
    public long elapsedTime;
    public long estimatedTime;
    public long overTime;
    public String url;
    public String compilationError;
    public BuildDataTests tests = new BuildDataTests();
}
