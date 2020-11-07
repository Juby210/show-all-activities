const { React } = require('powercord/webpack');
const { SwitchItem } = require('powercord/components/settings');

module.exports = class Settings extends React.PureComponent {
  render () {
    const { getSetting, toggleSetting } = this.props;
    return (
      <>
        <SwitchItem
          value={this.props.getSetting('useButtons')}
          onChange={() => this.props.toggleSetting('useButtons')}
          note='Use buttons instead of showing all categories at the same time'
        >
            Use Buttons
        </SwitchItem>
        <SwitchItem
          value={getSetting('topButtons')}
          onChange={() => toggleSetting('topButtons')}
          note='Whether to display buttons above activity'
          disabled={!getSetting('useButtons')}
        >
            Top Buttons
        </SwitchItem>
        <SwitchItem
          value={getSetting('alwaysButtons')}
          onChange={() => toggleSetting('alwaysButtons')}
          note='Whether to always display buttons'
          disabled={!getSetting('useButtons')}
        >
            Always Show Buttons
        </SwitchItem>
        <SwitchItem
          value={getSetting('collapsibleHeaders')}
          onChange={() => toggleSetting('collapsibleHeaders')}
          note='Whether headers should be collapsible'
          disabled={getSetting('useButtons')}
        >
            Collapsible Headers
        </SwitchItem>
        <SwitchItem
          value={getSetting('defaultState')}
          onChange={() => toggleSetting('defaultState')}
          note='Whether collapsible headers should be open or closed by default'
          disabled={getSetting('useButtons') || !getSetting('collapsibleHeaders')}
        >
            Default State
        </SwitchItem>
      </>
    );
  }
};
