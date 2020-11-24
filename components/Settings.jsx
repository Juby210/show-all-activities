const { React } = require('powercord/webpack')
const { SwitchItem } = require('powercord/components/settings')

module.exports = ({ getSetting, toggleSetting }) => <>
    <SwitchItem
        value={getSetting('useButtons')}
        onChange={() => toggleSetting('useButtons')}
    >Use Buttons
    </SwitchItem>
    <SwitchItem
        value={getSetting('collapsibleActivities')}
        onChange={() => toggleSetting('collapsibleActivities')}
        note='Show activities as collapsible "categories" (only works with ≥2 activities)'
        disabled={getSetting('useButtons')}
    >Collapsible Activities</SwitchItem>
    <SwitchItem
        value={getSetting('autoOpen')}
        onChange={() => toggleSetting('autoOpen')}
        disabled={getSetting('useButtons') || !getSetting('collapsibleActivities')}
    >Auto open activities</SwitchItem>
</>
