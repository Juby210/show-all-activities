const { Plugin } = require('powercord/entities');
const {
  getModule,
  getModuleByDisplayName,
  i18n: { Messages },
  React
} = require('powercord/webpack');
const { Button, Icon, Tooltip } = require('powercord/components');
const { findInReactTree } = require('powercord/util');
const { inject, uninject } = require('powercord/injector');

const CollapsibleActivity = require('./components/CollapsibleActivity');
const Settings = require('./components/Settings');

let temp;
const filterActivities = (a, i) => {
  if (i === 0) {
    temp = [];
  }
  if (temp.includes(a.application_id || a.name)) {
    return false;
  }
  temp.push(a.application_id || a.name);
  return a.type !== 4;
};

module.exports = class ShowAllActivities extends Plugin {
  async startPlugin () {
    this.loadStylesheet('style.css');
    powercord.api.settings.registerSettings(this.entityID, {
      category: this.entityID,
      label: 'Show All Activities',
      render: Settings
    });
    const classes = await getModule([ 'iconButtonSize' ]);
    const { getActivities } = await getModule([ 'getActivities' ]);
    const { getGame } = await getModule([ 'getGame', 'getGameByName' ]);
    const UserActivity = await getModuleByDisplayName('UserActivity');

    inject(
      'show-all-activities-pre',
      UserActivity.prototype,
      'render',
      function (args) {
        if (this.props.__saa) {
          return args;
        }
        const activities = getActivities(this.props.user.id).filter(
          filterActivities
        );
        if (!activities || !activities.length) {
          return args;
        }
        if (!this.state) {
          this.state = { activity: activities.indexOf(this.props.activity) };
        } else {
          const activity = activities[this.state.activity];
          if (!activity) {
            return args;
          }
          this.props.activity = activity;
          this.props.game = getGame(activity.application_id);
        }
        return args;
      },
      true
    );

    const _this = this;
    inject(
      'show-all-activities',
      UserActivity.prototype,
      'render',
      function (_, res) {
        if (this.props.__saa) {
          res = res.props.children;
          const actions = findInReactTree(res, (c) => c && c.onOpenConnections);
          if (actions) {
            actions.activity = this.props.activity;
          }
          return res;
        }

        const activities = getActivities(this.props.user.id).filter(
          filterActivities
        );

        const useButtons = _this.settings.get('useButtons');

        if (
          !res?.props?.children ||
          !activities ||
          !activities.length ||
          (!useButtons && activities.length <= 1)
        ) {
          return res;
        }

        if (!useButtons) {
          res.props.children = activities.map((a) =>
            React.createElement(CollapsibleActivity, {
              ...this.props,
              activity: a,
              settings: _this.settings,
              game: getGame(a.application_id)
            })
          );
          return res;
        }

        // eslint-disable-next-line consistent-this
        const _this2 = this;
        const topButtons = _this.settings.get('topButtons');
        const alwaysButtons = _this.settings.get('alwaysButtons');

        function createButton (left) {
          return React.createElement(
            Tooltip,
            {
              className: `allactivities-margin${topButtons ? ' allactivities-width' : ''}`,
              text: left ? Messages.PAGINATION_PREVIOUS : Messages.NEXT
            },
            React.createElement(
              Button,
              {
                className: !topButtons ? classes.iconButtonSize : 'allactivities-width',
                size: Button.Sizes.MIN,
                color: Button.Colors.WHITE,
                look: Button.Looks.OUTLINED,
                onClick () {
                  if ((_this2.state.activity - (left ? 1 : -1)) < 0 || (_this2.state.activity - (left ? 1 : -1)) >= activities.length) {
                    return;
                  }
                  _this2.setState({ activity: _this2.state.activity - (left ? 1 : -1) });
                },
                disabled: alwaysButtons && (_this2.state.activity - (left ? 1 : -1) < 0 || (_this2.state.activity - (left ? 1 : -1)) >= activities.length)
              },
              React.createElement(Icon, { direction: left ? 'LEFT' : 'RIGHT',
                name: 'Arrow' })
            )
          );
        }

        function createLeftButton () {
          return createButton(true);
        }
        function createRightButton () {
          return createButton(false);
        }
        const { children: children1 } = res.props;
        const { children: children2 } = res.props.children[1].props;

        if (topButtons) {
          children1.unshift(
            React.createElement(
              'div',
              {
                style: {
                  marginBottom: '8px',
                  display: 'flex'
                }
              },
              (this.state.activity !== 0 || alwaysButtons) ? createLeftButton() : '',
              (this.state.activity < activities.length - 1 || alwaysButtons) ? createRightButton() : ''
            )
          );
        } else {
          if (this.state.activity !== 0 || alwaysButtons) {
            children2.unshift(createLeftButton());
          }
          if (this.state.activity < activities.length - 1 || alwaysButtons) {
            children2.push(createRightButton());
          }
        }

        const actions = findInReactTree(
          res.props,
          (c) => c && c.onOpenConnections
        );
        if (actions) {
          actions.activity = this.props.activity;
        }
        return res;
      }
    );
  }

  pluginWillUnload () {
    powercord.api.settings.unregisterSettings(this.entityID);
    uninject('show-all-activities-pre');
    uninject('show-all-activities');
  }
};
