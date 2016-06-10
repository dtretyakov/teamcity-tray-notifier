package jetbrains.buildServer.notification.tray.web;

import jetbrains.buildServer.controllers.BaseController;
import jetbrains.buildServer.notification.NotificationRulesManager;
import jetbrains.buildServer.notification.tray.NotifierConstants;
import jetbrains.buildServer.serverSide.SBuildServer;
import jetbrains.buildServer.users.User;
import jetbrains.buildServer.web.openapi.PluginDescriptor;
import jetbrains.buildServer.web.openapi.WebControllerManager;
import jetbrains.buildServer.web.util.SessionUser;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Displays selected user builds.
 */
public class UserBuildsController extends BaseController {
    private final NotificationRulesManager myRulesManager;
    private final String myJspPath;

    public UserBuildsController(final SBuildServer server,
                                final PluginDescriptor pluginDescriptor,
                                final NotificationRulesManager rulesManager,
                                final WebControllerManager controllerManager) {
        super(server);
        myJspPath = pluginDescriptor.getPluginResourcesPath("viewBuilds.jsp");
        myRulesManager = rulesManager;

        final String url = String.format("/%s/viewBuilds.html", NotifierConstants.NOTIFIER_TYPE);
        controllerManager.registerController(url, this);
    }

    @Override
    @Nullable
    protected ModelAndView doHandle(@NotNull final HttpServletRequest request, @NotNull final HttpServletResponse response) throws Exception {
        final ModelAndView result = new ModelAndView(myJspPath);

        final User user = SessionUser.getUser(request);
        result.getModel().put("pluginName", NotifierConstants.NOTIFIER_TYPE);
        result.getModel().put("buildTypes", myServer.getStatusProvider().getWatchedBuildTypes(user, NotifierConstants.NOTIFIER_TYPE));
        result.getModel().put("runningBuilds", myServer.getRunningStatus(user, null));

        final long userId = user.getId();
        result.getModel().put("hasRules", !myRulesManager.getUserNotificationRules(userId, NotifierConstants.NOTIFIER_TYPE).isEmpty());
        result.getModel().put("userId", userId);

        return result;
    }
}
