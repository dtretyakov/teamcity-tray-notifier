<%@include file="/include-internal.jsp"%>
<jsp:useBean id="userId" scope="request" type="java.lang.Long"/>
<jsp:useBean id="hasRules" scope="request" type="java.lang.Boolean"/>
<jsp:useBean id="buildTypes" scope="request" type="java.util.Map<jetbrains.buildServer.serverSide.SProject,java.util.List<jetbrains.buildServer.serverSide.SBuildType> >"/>
<jsp:useBean id="runningBuilds" scope="request" type="java.util.Map<jetbrains.buildServer.serverSide.SBuildType,java.util.List<jetbrains.buildServer.serverSide.SRunningBuild> >"/>
<jsp:useBean id="pluginName" scope="request" type="java.lang.String"/>
<bs:externalPage>
  <jsp:attribute name="page_title">TeamCity - View Builds</jsp:attribute>
  <jsp:attribute name="head_include">
    <bs:linkCSS>
      /css/tabs.css
      /plugins/${pluginName}/css/notifierCommon.css
      /plugins/${pluginName}/css/notifierContent.css
    </bs:linkCSS>
    <bs:linkScript>
      /js/bs/refresh.js
      /js/bs/tabs.js
      /js/bs/issues.js
      /js/bs/runningBuilds.js
      /js/bs/stopBuild.js
      /js/bs/activation.js
      /js/bs/backgroundLoader.js
      /plugins/${pluginName}/js/extension.js
    </bs:linkScript>
    <script type="text/javascript">
      Win32.Extension.setAuthorizedUser(${userId});

      BS.Socket.init(${serverPushFeature.enabled});

      $j(document).ready(function() {
        var updateWindowSize = function() {
          var height = $j(window).innerHeight();

          height -= $j("#header").height();
          height -= 8; ///body border
          height -= 8; ///panel padding
          height -= 2; ///header border

          $j('div.panel').css('height', height);
        };

        $j(window).resize(updateWindowSize);
        updateWindowSize();

        Win32.UpdateTitle('title', window['base_uri']);

        BS.EventTracker.startTracking("<c:url value='/eventTracker.html'/>");
      });

    </script>
  </jsp:attribute>
  <jsp:attribute name="body_include">
    <div id="header">
      <div class="actions">
        <a title="Refresh" class="refresh" href="#" onclick="BS.reload(true); return false;"><i class="icon-refresh"></i></a>
        <a title="Close" class="close" href="#" onclick="Win32.Extension.closeMe(); return false;"><i class="icon-remove-sign"></i></a>
      </div>
      <div class="title" id="title">TeamCity Quick View</div>
    </div>

    <div class="panel">

      <et:subscribeOnEvents>
        <jsp:attribute name="eventNames">
          BUILD_STARTED
          BUILD_FINISHED
          BUILD_INTERRUPTED
          BUILD_TYPE_REGISTERED
          BUILD_TYPE_UNREGISTERED
          PROJECT_PERSISTED
          PROJECT_RESTORED
          PROJECT_REMOVED
          PROJECT_CREATED
          PROJECT_ARCHIVED
          PROJECT_DEARCHIVED
        </jsp:attribute>
        <jsp:attribute name="eventHandler">
          BS.reload();
        </jsp:attribute>
      </et:subscribeOnEvents>

      <et:subscribeOnUserEvents userId="${currentUser.id}">
        <jsp:attribute name="eventNames">
          NOTIFICATION_RULES_CHANGED
        </jsp:attribute>
        <jsp:attribute name="eventHandler">
          BS.reload();
        </jsp:attribute>
      </et:subscribeOnUserEvents>

      <c:if test="${not hasRules}">
        <p class="messageEmpty">You do not monitor any build configurations or there are no build configurations at all.
          <a href="<c:url value="/profile.html?tab=userNotifications&notificatorType=${pluginName}"/>" target="_blank">Edit settings</a>
        </p>
      </c:if>

      <c:if test="${hasRules and empty buildTypes}">
        <p class="messageEmpty">Nothing to show. Latest finished builds do not include your changes.<br/>
          <a href="<c:url value="/profile.html?tab=userNotifications&notificatorType=${pluginName}"/>" target="_blank">Edit settings</a>
        </p>
      </c:if>

      <c:if test="${not empty buildTypes}">
        <c:set var="lastProject" value=""/>
        <c:forEach var="item" items="${buildTypes}">
          <c:if test="${lastProject ne item.key}">
            <!-- Project block header -->
            <c:set var="projectId" value="${item.key.projectId}"/>

            <div class="projectHeader"><c:out value="${item.key.fullName}"/></div>

            <!-- Project build types -->
            <c:forEach var="buildType" items="${item.value}">
              <c:set var="theRunningBuilds" value="${runningBuilds[buildType]}" scope="request"/>
              <c:if test="${not empty theRunningBuilds or not empty buildType.lastChangesFinished}">
                <div class="buildConfigurationName">
                  <bs:buildTypeIcon buildType="${buildType}"/>
                  <bs:buildTypeLink buildType="${buildType}" target="_blank"/>
                  <c:if test="${buildType.responsibilityInfo.state.active}">
                    <span class="investigator">(Investigator: <c:out value="${buildType.responsibilityInfo.responsibleUser.descriptiveName}"/>)</span>
                  </c:if>
                </div>
                <table class="builds">
                  <c:forEach var="buildData" items="${theRunningBuilds}">
                    <%@ include file="showBuildRow.jsp" %>
                  </c:forEach>
                  <c:if test="${not empty buildType.lastChangesFinished}">
                    <c:set var="buildData" value="${buildType.lastChangesFinished}"/>
                    <%@ include file="showBuildRow.jsp" %>
                  </c:if>
                </table>
              </c:if>
            </c:forEach>
            <c:set var="lastProject" value="${item.key}"/>
          </c:if>
        </c:forEach>
      </c:if>
    </div>
  </jsp:attribute>
</bs:externalPage>
