/*
 * Copyright 2000-2016 JetBrains s.r.o.
 *
 * Licensed under the Apache License, Version 2.0 (the "License").
 * See LICENSE in the project root for license information.
 */

package jetbrains.buildServer.notification.tray;

import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import jetbrains.buildServer.notification.tray.model.BuildData;
import jetbrains.buildServer.notification.tray.model.BuildNotification;
import jetbrains.buildServer.notification.tray.model.Notification;
import org.jetbrains.annotations.NotNull;
import org.testng.Assert;
import org.testng.annotations.Test;

/**
 * Tray notifier.
 */
@Test
public class NotificationSerializerTests {

    public void testBuildNotificationSerialization() {
        Gson gson = new Gson();
        final Notification notification = getBuildNotification();

        String string = gson.toJson(notification, BuildNotification.class);

        String expected = "{\"build\":{\"buildName\":\"buildName\",\"agentName\":\"agentName\",\"elapsedTime\":0,\"estimatedTime\":0,\"overTime\":0,\"tests\":{}},\"type\":\"build\"}";
        Assert.assertEquals(string, expected);
    }

    @NotNull
    private Notification getBuildNotification() {
        final BuildData data = new BuildData();
        data.buildName = "buildName";
        data.agentName = "agentName";
        return new BuildNotification(data);
    }
}
