package jetbrains.buildServer.notification.tray.web;

import jetbrains.buildServer.notification.tray.NotifierConstants;
import jetbrains.buildServer.web.openapi.*;
import org.jetbrains.annotations.NotNull;

import javax.servlet.http.HttpServletRequest;
import java.util.Map;

/**
 * Tray notifier download links extension.
 */
public class DownloadPageExtension extends SimplePageExtension {

    private final PluginDescriptor myPluginDescriptor;

    public DownloadPageExtension(@NotNull PagePlaces places, @NotNull PluginDescriptor pluginDescriptor) {
        super(places);
        setIncludeUrl("trayNotifierDownload.jsp");
        setPlaceId(PlaceId.MY_TOOLS_SECTION);
        setPluginName(NotifierConstants.NOTIFIER_TYPE);
        setPosition(PositionConstraint.last());
        myPluginDescriptor = pluginDescriptor;
    }

    @Override
    public void fillModel(@NotNull final Map<String, Object> model, @NotNull final HttpServletRequest request) {
        super.fillModel(model, request);
        model.put("pluginName", NotifierConstants.NOTIFIER_TYPE);
    }
}
