<%@ taglib prefix="bs" tagdir="/WEB-INF/tags" %>
<tr>
  <bs:buildRow build="${buildData}" showBranchName="true"/>
  <td class="buildNumber"><bs:buildNumber buildData="${buildData}"/></td>
  <td>
    <bs:buildDataIcon buildData="${buildData}" imgId="build:${buildData.buildId}:img"/>
    <bs:resultsLink build="${buildData}" attrs="target='_blank'" noPopup="true"><span id="build:${buildData.buildId}:text"><c:out value="${buildData.statusDescriptor.text}"/></span></bs:resultsLink>
  </td>
  <td class="changesColumn">
    <bs:changesLinkFull build="${buildData}" noPopup="true" attrs="target='_blank'" noUsername="true"/>
  </td>
</tr>