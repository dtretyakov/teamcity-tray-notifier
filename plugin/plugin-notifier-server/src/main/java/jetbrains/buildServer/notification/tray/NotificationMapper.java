package jetbrains.buildServer.notification.tray;

import jetbrains.buildServer.notification.tray.model.BuildData;
import jetbrains.buildServer.notification.tray.model.BuildNotification;
import jetbrains.buildServer.serverSide.BuildStatistics;
import jetbrains.buildServer.serverSide.BuildStatisticsOptions;
import jetbrains.buildServer.serverSide.SBuild;
import jetbrains.buildServer.serverSide.SRunningBuild;

import java.util.Map;

/**
 * Notifications mapper.
 */
public final class NotificationMapper {

    public static BuildNotification mapBuildNotification(final String status, final Map<String, Object> buildMap) {
        final BuildData data = new BuildData();
        data.status = status;
        data.agentName = (String) buildMap.get("agentName");

        final SBuild build = (SBuild) buildMap.get("build");
        data.buildName = build.getFullName();
        data.buildNumber = build.getBuildNumber();
        data.personal = build.isPersonal();

        if (build instanceof SRunningBuild){
            final SRunningBuild runningBuild = (SRunningBuild)build;
            data.elapsedTime = runningBuild.getElapsedTime();
            data.estimatedTime = runningBuild.getDurationEstimate();
            data.overTime = runningBuild.getDurationOvertime();
        }

        data.url = (String)buildMap.get("buildResultsLink");
        data.compilationError = (String)buildMap.get("buildCompilationErrors");

        BuildStatistics statistics = build.getBuildStatistics(BuildStatisticsOptions.ALL_TESTS_NO_DETAILS);
        data.tests.failed = statistics.getFailedTestCount();
        data.tests.ignored = statistics.getIgnoredTestCount();
        data.tests.passed = statistics.getPassedTestCount();

        return new BuildNotification(data);
    }
}
