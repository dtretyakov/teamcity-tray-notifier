package jetbrains.buildServer.notification.tray.web;

import com.intellij.openapi.diagnostic.Logger;
import jetbrains.buildServer.notification.tray.model.Message;
import jetbrains.buildServer.users.SUser;
import jetbrains.buildServer.web.util.SessionUser;
import jetbrains.buildServer.web.util.WebUtil;
import org.atmosphere.cpr.*;
import org.atmosphere.handler.AbstractReflectorAtmosphereHandler;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Notification request handler.
 */
public class NotificationHandler extends AbstractReflectorAtmosphereHandler {
    private static final Logger LOG = Logger.getInstance(NotificationHandler.class.getName());
    private static final String USER_ID = "USER_ID";
    private static final Map<Long, AtmosphereResource> myResources = new ConcurrentHashMap<Long, AtmosphereResource>();

    @Override
    public final void onRequest(AtmosphereResource resource) throws IOException {
        if (resource.getRequest().getMethod().equalsIgnoreCase("GET")) {
            onOpen(resource);
        }
    }

    @Override
    public final void onStateChange(AtmosphereResourceEvent event) throws IOException {
        final AtmosphereResource resource = event.getResource();
        LOG.debug(String.format("%s with event %s", resource.uuid(), event));

        if (event.isCancelled() || event.isClosedByApplication() || event.isClosedByClient()) {
            onDisconnect(resource);
        } else if (event.getMessage() != null && List.class.isAssignableFrom(event.getMessage().getClass())) {
            List<String> messages = List.class.cast(event.getMessage());
            for (String t : messages) {
                onMessage(resource, t);
            }
        } else if (event.isResuming()) {
            onResume(resource);
        } else if (event.isResumedOnTimeout()) {
            onTimeout(resource);
        } else if (event.isSuspended()) {
            onMessage(resource, (String) event.getMessage());
        }

        postStateChange(event);
    }

    private void onMessage(AtmosphereResource resource, String message) {
        resource.getResponse().write(message);
    }

    @Override
    public final void destroy() {
        myResources.clear();
    }

    /**
     * This method will be invoked when an connection has been received and not haven't yet be suspended. Note that
     * the connection will be suspended AFTER the method has been invoked when used with {@link org.atmosphere.interceptor.AtmosphereResourceLifecycleInterceptor}
     *
     * @param resource an {@link AtmosphereResource}
     * @throws IOException
     */
    public void onOpen(AtmosphereResource resource) throws IOException {
        final SUser currentUser = SessionUser.getUser(resource.getRequest());
        if (currentUser == null) {
            LOG.error("Websocket Open request with unknown user. Request: " + WebUtil.getRequestDump(resource.getRequest()));
            return;
        }

        LOG.debug("WebSocket connection is opened by " + currentUser.getUsername() + ". Connection UUID: " + resource.uuid());

        AtmosphereResourceSessionFactory.getDefault().getSession(resource).setAttribute(USER_ID, currentUser.getId());
        myResources.put(currentUser.getId(), resource);

        resource.getResponse().write("|connected|");

        resource.suspend();
    }

    /**
     * This method will be invoked during the process of resuming a connection. By default this method does nothing.
     *
     * @param resource an {@link AtmosphereResource}.
     * @throws IOException
     */
    public void onResume(AtmosphereResource resource) throws IOException {
        restoreResource(resource);
    }

    /**
     * This method will be invoked when a suspended connection times out, e.g no activity has occurred for the
     * specified time used when suspending. By default this method does nothing.
     *
     * @param resource an {@link AtmosphereResource}.
     * @throws IOException
     */
    public void onTimeout(AtmosphereResource resource) throws IOException {
        restoreResource(resource);
    }

    /**
     * This method will be invoked when the underlying WebServer detects a connection has been closed. Please
     * note that not all WebServer supports that features (see Atmosphere's WIKI for help). By default this method does nothing.
     *
     * @param resource an {@link AtmosphereResource}.
     * @throws IOException
     */
    public void onDisconnect(AtmosphereResource resource) throws IOException {
        removeResource(resource);
    }

    private void removeResource(AtmosphereResource resource) {
        final Long userId = AtmosphereResourceSessionFactory.getDefault().getSession(resource).getAttribute(USER_ID, Long.class);
        myResources.remove(userId);
    }

    private AtmosphereResource getOriginalResource(AtmosphereResource resource) throws IOException {
        final String originalUUID = (String) resource.getRequest().getAttribute(ApplicationConfig.SUSPENDED_ATMOSPHERE_RESOURCE_UUID);
        final AtmosphereResource originalResource = AtmosphereResourceFactory.getDefault().find(originalUUID);
        if (originalResource == null) {
            LOG.warn(String.format("Connection received from the unknown client. Current request uuid: %s, original request uuid: %s.", resource.uuid(), originalUUID));
            onRequest(resource);
            return null;
        }

        return originalResource;
    }

    private void restoreResource(AtmosphereResource resource) throws IOException {
        final AtmosphereResource originalResource = getOriginalResource(resource);
        if (originalResource != null) {
            removeResource(originalResource);
        }

        onOpen(resource);
    }

    public void broadcast(Message message, Set<SUser> users) {
        for (SUser user : users) {
            final AtmosphereResource resource = myResources.get(user.getId());
            if (resource == null) continue;
            resource.getBroadcaster().broadcast("|" + message.getMessage() + "|");
        }
    }
}
