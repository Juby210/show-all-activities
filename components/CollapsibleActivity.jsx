const { React, getModuleByDisplayName, i18n: { Messages } } = require('powercord/webpack');
const { findInReactTree } = require('powercord/util');
const { Icon } = require('powercord/components');

const UserActivity = getModuleByDisplayName('UserActivity', false);

module.exports = class CollapsibleActivity extends React.PureComponent {
   constructor(props) {
      super(props);
      this.state = {
         opened: props.defaultOpened
      };
   }

   render() {
      if (this.props.i > 0) delete this.props.streamingGuild;

      const header = UserActivity.prototype.renderHeader.apply({ props: this.props, activity: this.props.activity });
      if (!Array.isArray(header?.props?.children)) return null;

      header.props.children.push(
         <Icon
            name={`ArrowDrop${this.state.opened ? 'Up' : 'Down'}`}
            className='allactivities-header-arrow'
         />
      );

      header.props.onClick = () => this.setState({ opened: !this.state.opened });
      header.props.className += ' allactivities-collapsibleheader';

      if (!this.state.opened) {
         const text = findInReactTree(header, t => t?.type?.displayName == 'OverflowTooltip');

         if (text && text?.props?.children == Messages.USER_ACTIVITY_HEADER_PLAYING) {
            text.props.children = `Playing ${this.props.activity.name}`;
         }

         return header;
      }

      return <>
         {header}
         <UserActivity __saa={true} {...this.props} hideHeader={true} />
      </>;
   }
};
