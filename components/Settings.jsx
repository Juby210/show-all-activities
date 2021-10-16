const { SwitchItem } = require('powercord/components/settings');
const { React } = require('powercord/webpack');

module.exports = React.memo(({ getSetting, toggleSetting }) =>
   <>
      <SwitchItem
         value={getSetting('collapsibleActivities')}
         onChange={() => toggleSetting('collapsibleActivities', false)}
         note='Show activities as collapsible "categories" (only works with ≥2 activities)'
      >
         Collapsible Activities
      </SwitchItem>
      <SwitchItem
         value={getSetting('autoOpen')}
         onChange={() => toggleSetting('autoOpen', true)}
         disabled={!getSetting('collapsibleActivities')}
      >
         Auto open activities
      </SwitchItem>
      <SwitchItem
         value={getSetting('autoOpenFirst')}
         onChange={() => toggleSetting('autoOpenFirst', true)}
         disabled={!getSetting('collapsibleActivities') || !getSetting('autoOpen')}
      >
         Only open first activity
      </SwitchItem>
   </>
);
