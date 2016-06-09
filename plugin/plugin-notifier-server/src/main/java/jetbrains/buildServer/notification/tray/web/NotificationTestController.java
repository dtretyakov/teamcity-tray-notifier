package jetbrains.buildServer.notification.tray.web;

import jetbrains.buildServer.controllers.BaseController;
import jetbrains.buildServer.web.openapi.PluginDescriptor;
import jetbrains.buildServer.web.openapi.WebControllerManager;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * Handles notification requests.
 */
public class NotificationTestController extends BaseController {

    private final PluginDescriptor myPluginDescriptor;

    public NotificationTestController(@NotNull final WebControllerManager controllerManager,
                                      @NotNull final PluginDescriptor pluginDescriptor) {
        myPluginDescriptor = pluginDescriptor;
        controllerManager.registerController("/notificationTest.html", this);
    }

    @Nullable
    @Override
    protected ModelAndView doHandle(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws Exception {
        return new ModelAndView(myPluginDescriptor.getPluginResourcesPath("notificationTest.jsp"));
    }
}
