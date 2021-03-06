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
import debounce from "debounce";
import React, { Component } from "react";
import { createFragmentContainer, RelayProp } from "react-relay";
import { Disposable } from "relay-runtime";
import { Loader, SemanticWIDTHS } from "semantic-ui-react";

import { WorkspaceListPage_system } from "./__generated__/WorkspaceListPage_system.graphql";
import { WorkspaceListPage_viewer } from "./__generated__/WorkspaceListPage_viewer.graphql";

import Page from "../components/Page";
import Welcome from "../components/Welcome";
import { IProps as IWorkspaceCardProps } from "../components/WorkspaceCard";
import WorkspaceCardGroup from "../components/WorkspaceCardGroup";
import WorkspaceSearch, {
  IProps as IWorkspaceSearchProps
} from "../components/WorkspaceSearch";
import { commit as cloneWorkspace } from "../mutations/cloneWorkspace";
import { commit as pullWorkspace } from "../mutations/pullWorkspace";
import { subscribe as subscribeProjectStored } from "../subscriptions/projectStored";
import { subscribe as subscribeSourceStored } from "../subscriptions/sourceStored";
import { subscribeWorkspaces as subscribeUserStored } from "../subscriptions/userStored";
import { subscribe as subscribeWorkspaceStored } from "../subscriptions/workspaceStored";

export interface IProps {
  relay: RelayProp;
  system: WorkspaceListPage_system;
  viewer: WorkspaceListPage_viewer;
}

interface IState {
  query: string;
  debouncedQuery: string;
  itemsPerRow: SemanticWIDTHS;
}

export class WorkspaceListPage extends Component<IProps, IState> {
  public state: IState = {
    debouncedQuery: "",
    itemsPerRow: 3,
    query: ""
  };

  private disposables: Disposable[] = [];

  private debounceQuery = debounce((debouncedQuery: string) => {
    this.setState({ debouncedQuery });
  }, 100);

  public render() {
    if (this.props.viewer.sources.edges.length < 1) {
      return <Welcome />;
    }

    const { viewer } = this.props;
    const { itemsPerRow, query, debouncedQuery } = this.state;

    let items = viewer.workspaces.edges.map(({ node }) => node);
    let isSyncing = false;

    for (const { node } of viewer.sources.edges) {
      if (node.isSyncing) {
        isSyncing = true;
        break;
      }
    }

    if (debouncedQuery) {
      items = items.filter(
        item => item.name.toLowerCase().indexOf(debouncedQuery) >= 0
      );
    }

    return (
      <Page
        header="Workspaces"
        subheader="A workspace is a collection of related Git repositories."
      >
        <WorkspaceSearch query={query} onChange={this.handleSearchChange} />
        <WorkspaceCardGroup
          items={items}
          itemsPerRow={itemsPerRow}
          onClone={this.handleClone}
          onPull={this.handlePull}
        />
        <Loader active={isSyncing && items.length < 1} />
      </Page>
    );
  }

  public componentDidMount() {
    const {
      relay: { environment },
      system: { lastMessageId }
    } = this.props;

    this.setItemsPerRow();
    window.addEventListener("resize", this.setItemsPerRow);

    this.disposables.push(
      {
        dispose: () => {
          window.removeEventListener("resize", this.setItemsPerRow);
        }
      },
      subscribeUserStored(environment, lastMessageId),
      subscribeSourceStored(environment, lastMessageId),
      subscribeWorkspaceStored(environment, lastMessageId),
      subscribeProjectStored(environment, lastMessageId)
    );
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private handleSearchChange = ({ query }: IWorkspaceSearchProps) => {
    this.setState({ query });
    this.debounceQuery(query);
  };

  private handleClone = ({ item: { id } }: IWorkspaceCardProps) => {
    cloneWorkspace(this.props.relay.environment, id);
  };

  private handlePull = ({ item: { id } }: IWorkspaceCardProps) => {
    pullWorkspace(this.props.relay.environment, id);
  };

  private setItemsPerRow = () => {
    let itemsPerRow = Math.floor(window.innerWidth / 384);
    itemsPerRow = Math.min(Math.max(itemsPerRow, 1), 16);
    this.setState({ itemsPerRow: itemsPerRow as SemanticWIDTHS });
  };
}

export default createFragmentContainer(
  WorkspaceListPage,
  graphql`
    fragment WorkspaceListPage_system on System {
      lastMessageId
    }
    fragment WorkspaceListPage_viewer on User {
      sources(first: 10000) {
        edges {
          node {
            isSyncing
          }
        }
      }
      workspaces(first: 10000)
        @connection(key: "WorkspaceListPage_workspaces") {
        edges {
          node {
            ...WorkspaceCardGroup_items
            name
          }
        }
      }
    }
  `
);
