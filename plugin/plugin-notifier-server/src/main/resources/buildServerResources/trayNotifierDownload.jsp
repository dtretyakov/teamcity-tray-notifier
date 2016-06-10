<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<jsp:useBean id="feedCustomizeLink" type="java.lang.String" scope="request"/>
<jsp:useBean id="pluginName" scope="request" type="java.lang.String"/>
<jsp:useBean id="pageUrl" type="java.lang.String" scope="request"/>

<style type="text/css">
    p.toolTitle.tray {
        background-image: url("/plugins/${pluginName}/img/teamcity.svg");
        background-repeat: no-repeat;
        background-size: 16px;
    }

    div.blockAgents p.trayLink {
        padding-left: 1em;
    }

    div.blockAgents p.trayLink a {
        display: inline-block;
    }

</style>

<p class="toolTitle tray">Tray Notifier</p>
<p class="trayLink">
    <span class="icon icon16 os-icon os-icon_lin" title="Linux"></span>
    <a href="https://github.com/dtretyakov/teamcity-tray-notifier">Download for Linux</a>
</p>
<p class="trayLink">
    <span class="icon icon16 os-icon os-icon_mac" title="Mac OS"></span>
    <a href="https://github.com/dtretyakov/teamcity-tray-notifier">Download for Mac OS</a>
</p>
<p class="trayLink">
    <span class="icon icon16 os-icon os-icon_win" title="Windows"></span>
    <a href="https://github.com/dtretyakov/teamcity-tray-notifier">Download for Windows</a>
</p>
