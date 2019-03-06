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
import React, { Component } from "react";
import { createFragmentContainer, RelayProp } from "react-relay";
import { Disposable } from "relay-runtime";
import { Confirm, Divider } from "semantic-ui-react";

import { SourceListPage_system } from "./__generated__/SourceListPage_system.graphql";
import { SourceListPage_viewer } from "./__generated__/SourceListPage_viewer.graphql";

import AddSourceForm, {
  IProps as IAddSourceFormProps,
  SourceType
} from "../components/AddSourceForm";
import Page from "../components/Page";
import SourceList from "../components/SourceList";
import { commit as addDirectorySource } from "../mutations/addDirectorySource";
import { commit as addGitSource } from "../mutations/addGitSource";
import { commit as deleteSource } from "../mutations/deleteSource";
import { subscribe as subscribeSourceDeleted } from "../subscriptions/sourceDeleted";
import { subscribe as subscribeSourceStored } from "../subscriptions/sourceStored";
import { subscribeSources as subscribeUserStored } from "../subscriptions/userStored";

export interface IProps {
  relay: RelayProp;
  system: SourceListPage_system;
  viewer: SourceListPage_viewer;
}

interface IState {
  type: SourceType;
  directory: string;
  repository: string;
  reference: string;
  showConfirmDelete: boolean;
  deleteId: string;
}

export class SourceListPage extends Component<IProps, IState> {
  public state = {
    deleteId: "",
    directory: "",
    reference: "",
    repository: "",
    showConfirmDelete: false,
    type: SourceType.Directory
  };

  private disposables: Disposable[] = [];

  public render() {
    const items = this.props.viewer.sources.edges.map(({ node }) => node);
    const { showConfirmDelete } = this.state;

    this.sortItems(items);

    return (
      <Page
        header="Sources"
        subheader="A source is a collection of workspaces. It can be a directory or a Git repository."
      >
        <h2>Add a New Source</h2>
        <AddSourceForm
          {...this.state}
          onSubmit={this.handleSubmit}
          onChange={this.handleChange}
        />
        <Divider hidden={true} />
        <h2>Current Sources</h2>
        <SourceList
          items={items}
          onDeleteDirectorySource={this.handleDelete}
          onDeleteGitSource={this.handleDelete}
        />
        <Confirm
          content="Are you sure your want to delete this source?"
          confirmButton="Delete"
          open={showConfirmDelete}
          onCancel={this.handleCancelDelete}
          onConfirm={this.handleConfirmDelete}
        />
      </Page>
    );
  }

  public componentDidMount() {
    const {
      relay: { environment },
      system: { lastMessageId }
    } = this.props;

    this.disposables.push(
      subscribeUserStored(environment, lastMessageId),
      subscribeSourceStored(environment, lastMessageId),
      // Note: currently sources are not deleted server side.
      subscribeSourceDeleted(environment, lastMessageId)
    );
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private sortItems(items: Array<{ directory?: string; repository?: string }>) {
    items.sort((a, b) => {
      const u = (a.directory || a.repository || "").toLowerCase();
      const v = (b.directory || b.repository || "").toLowerCase();
      if (u < v) {
        return -1;
      }
      if (u > v) {
        return 1;
      }
      return 0;
    });
  }

  private handleChange = (values: IAddSourceFormProps) => {
    this.setState({ ...this.state, ...values });
  };

  private handleSubmit = (values: IAddSourceFormProps) => {
    const { type, directory, repository, reference } = values;

    switch (type) {
      case "directory":
        addDirectorySource(this.props.relay.environment, {
          directory
        });
        break;
      case "git":
        addGitSource(this.props.relay.environment, {
          reference: reference || "refs/heads/master", // TODO: move default elsewhere
          repository
        });
        break;
    }

    this.setState({
      directory: "",
      reference: "",
      repository: ""
    });
  };

  private handleDelete = ({ item: { id } }: { item: { id: string } }) => {
    this.setState({ showConfirmDelete: true, deleteId: id });
  };

  private handleCancelDelete = () => {
    this.setState({ showConfirmDelete: false });
  };

  private handleConfirmDelete = () => {
    deleteSource(this.props.relay.environment, this.state.deleteId);
    this.setState({ showConfirmDelete: false });
  };
}

export default createFragmentContainer(
  SourceListPage,
  graphql`
    fragment SourceListPage_system on System {
      lastMessageId
    }
    fragment SourceListPage_viewer on User {
      sources(first: 1000) @connection(key: "SourceListPage_sources") {
        edges {
          node {
            ... on DirectorySource {
              directory
            }
            ... on GitSource {
              repository
            }
            ...SourceList_items
          }
        }
      }
    }
  `
);
