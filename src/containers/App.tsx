// Copyright 2019 Stratumn
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import graphql from "babel-plugin-relay/macro";
import { Router } from "found";
import React, { Component } from "react";
import Helmet from "react-helmet";
import { createFragmentContainer, RelayProp } from "react-relay";
import { Disposable } from "relay-runtime";

import { App_system } from "./__generated__/App_system.graphql";

import Menu from "../components/Menu";
import { subscribe as subscribeJobMetricsStored } from "../subscriptions/jobMetricsStored";
import { subscribe as subscribeLogMetricsStored } from "../subscriptions/logMetricsStored";
import { subscribe as subscribeServiceMetricsStored } from "../subscriptions/serviceMetricsStored";

import "./App.css";

export interface IProps {
  relay: RelayProp;
  router: Router;
  system: App_system;
}

interface IState {
  showSidebar: boolean;
}

export class App extends Component<IProps, IState> {

  public state = {
    showSidebar: false,
  };

  private disposables: Disposable[] = [];

  public render() {
    const { system, children } = this.props;
    const { showSidebar } = this.state;

    return (
      <div className="App">
        <Helmet titleTemplate="%s | Ground Control" />
        <Menu
          system={system}
          showSidebar={showSidebar}
          onShowSidebar={this.handleSidebar.bind(this, true)}
          onHideSidebar={this.handleSidebar.bind(this, false)}
        />
        {children}
      </div>
    );
  }

  public componentDidMount() {
    const { relay: { environment }, system: { lastMessageId } } = this.props;

    this.disposables.push(
      {
        dispose: this.props.router.addTransitionHook(() => {
          this.setState({ showSidebar: false });
          return true;
        }),
      },
      subscribeServiceMetricsStored(environment, lastMessageId),
      subscribeJobMetricsStored(environment, lastMessageId),
      subscribeLogMetricsStored(environment, lastMessageId),
    );
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private handleSidebar(show: boolean) {
    this.setState({ showSidebar: show });
  }

}

export default createFragmentContainer(App, graphql`
  fragment App_system on System {
    lastMessageId
    ...Menu_system
  }`,
);
