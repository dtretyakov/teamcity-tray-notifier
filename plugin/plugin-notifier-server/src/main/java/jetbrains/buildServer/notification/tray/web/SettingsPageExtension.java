package jetbrains.buildServer.notification.tray.web;

import jetbrains.buildServer.notification.tray.NotifierConstants;
import jetbrains.buildServer.web.openapi.PagePlaces;
import jetbrains.buildServer.web.openapi.PlaceId;
import jetbrains.buildServer.web.openapi.SimplePageExtension;
import org.jetbrains.annotations.NotNull;

import javax.servlet.http.HttpServletRequest;

/**
 * Tray notifier settings extension.
 */
public class SettingsPageExtension extends SimplePageExtension {

  public SettingsPageExtension(@NotNull final PagePlaces pagePlaces) {
    super(pagePlaces);
    setIncludeUrl("trayNotifierSettings.jsp");
    setPlaceId(PlaceId.NOTIFIER_SETTINGS_FRAGMENT);
    setPluginName(NotifierConstants.NOTIFIER_TYPE);
  }

  @Override
  public boolean isAvailable(@NotNull HttpServletRequest request) {
    return getPluginName().equals(request.getParameter("notificatorType"));
  }
}
