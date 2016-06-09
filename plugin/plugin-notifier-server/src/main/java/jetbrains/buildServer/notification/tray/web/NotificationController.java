package jetbrains.buildServer.notification.tray.web;

import jetbrains.buildServer.controllers.BaseController;
import jetbrains.buildServer.notification.tray.NotifierConstants;
import jetbrains.buildServer.web.openapi.WebControllerManager;
import org.atmosphere.cache.UUIDBroadcasterCache;
import org.atmosphere.client.TrackMessageSizeInterceptor;
import org.atmosphere.cpr.*;
import org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor;
import org.atmosphere.interceptor.HeartbeatInterceptor;
import org.atmosphere.interceptor.IdleResourceInterceptor;
import org.jetbrains.annotations.NotNull;
import org.jetbrains.annotations.Nullable;
import org.springframework.web.servlet.ModelAndView;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Arrays;

/**
 * Handles notification requests.
 */
public class NotificationController extends BaseController {
    private static final String ASYNC_SUPPORTED = "org.apache.catalina.ASYNC_SUPPORTED";
    private final NotificationHandler myNotificationHandler;
    private final AtmosphereFramework myFramework;
    private final String myPath;

    public NotificationController(@NotNull final WebControllerManager controllerManager,
                                  @NotNull final NotificationHandler notificationHandler) {
        myPath = String.format("/%s/notifications.html", NotifierConstants.NOTIFIER_TYPE);
        controllerManager.registerController(myPath, this);
        myNotificationHandler = notificationHandler;
        myFramework = createFramework();
    }

    @Nullable
    @Override
    protected ModelAndView doHandle(@NotNull HttpServletRequest request, @NotNull HttpServletResponse response) throws Exception {
        request.setAttribute(ASYNC_SUPPORTED, Boolean.TRUE);
        myFramework.doCometSupport(AtmosphereRequest.wrap(request), AtmosphereResponse.wrap(response));
        return null;
    }

    private AtmosphereFramework createFramework() {
        final AtmosphereFramework atmosphereFramework = new AtmosphereFramework();
        atmosphereFramework.addInitParameter(ApplicationConfig.BROADCASTER_SHARABLE_THREAD_POOLS, "true");
        atmosphereFramework.addInitParameter(ApplicationConfig.BROADCASTER_LIFECYCLE_POLICY, "EMPTY");
        atmosphereFramework.addInitParameter(ApplicationConfig.BROADCASTER_MESSAGE_PROCESSING_THREADPOOL_MAXSIZE, "10");
        atmosphereFramework.addInitParameter(ApplicationConfig.BROADCASTER_ASYNC_WRITE_THREADPOOL_MAXSIZE, "10");
        atmosphereFramework.addInitParameter(ApplicationConfig.BROADCASTER_CACHE, UUIDBroadcasterCache.class.getName());
        atmosphereFramework.addInitParameter(ApplicationConfig.DISABLE_ATMOSPHEREINTERCEPTOR, "true");
        atmosphereFramework.addInitParameter(ApplicationConfig.JSR356_MAPPING_PATH, myPath);
        atmosphereFramework.init();

        atmosphereFramework.getBroadcasterFactory().lookup(myPath, true);
        atmosphereFramework.addAtmosphereHandler(myPath, myNotificationHandler, Arrays.asList(
                new AtmosphereResourceLifecycleInterceptor(),
                new HeartbeatInterceptor(),
                new IdleResourceInterceptor(),
                new TrackMessageSizeInterceptor()));

        return atmosphereFramework;
    }
}
