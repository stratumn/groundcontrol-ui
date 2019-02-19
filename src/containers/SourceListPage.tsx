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
import { Confirm, Segment } from "semantic-ui-react";

import { SourceListPage_system } from "./__generated__/SourceListPage_system.graphql";
import { SourceListPage_viewer } from "./__generated__/SourceListPage_viewer.graphql";

import AddSourceForm, {
  IProps as IAddSourceFormProps,
  SourceType,
} from "../components/AddSourceForm";
import Page from "../components/Page";
import SourceList from "../components/SourceList";
import { commit as addDirectorySource } from "../mutations/addDirectorySource";
import { commit as addGitSource } from "../mutations/addGitSource";
import { commit as deleteSource } from "../mutations/deleteSource";
import { subscribe as subscribeSourceDeleted } from "../subscriptions/sourceDeleted";
import { subscribe as subscribeSourceUpserted } from "../subscriptions/sourceUpserted";

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
    type: SourceType.Directory,
  };

  private disposables: Disposable[] = [];

  public render() {
    const items = this.props.viewer.sources.edges.map(({ node }) => node);
    const { showConfirmDelete } = this.state;

    return (
      <Page
        header="Sources"
        subheader="A source is a collection of workspaces. It can either be a directory or a Git repository"
        icon="folder open"
      >
        <Segment>
          <h3>Add a New Source</h3>
          <AddSourceForm
            {...this.state}
            onSubmit={this.handleSubmit}
            onChange={this.handleChange}
          />
        </Segment>
        <Segment>
          <h3>Current Sources</h3>
          <SourceList
            items={items}
            onDeleteDirectorySource={this.handleDelete}
            onDeleteGitSource={this.handleDelete}
          />
        </Segment>
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
    const { relay: { environment }, system: { lastMessageId } } = this.props;

    this.disposables.push(subscribeSourceUpserted(environment, lastMessageId));
    this.disposables.push(subscribeSourceDeleted(environment, lastMessageId));
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private handleChange = (values: IAddSourceFormProps) => {
    this.setState({ ...this.state, ...values });
  }

  private handleSubmit = (values: IAddSourceFormProps) => {
    const { type, directory, repository, reference } = values;

    switch (type) {
    case "directory":
      addDirectorySource(this.props.relay.environment, {
        directory,
      });
      break;
    case "git":
      addGitSource(this.props.relay.environment, {
        reference: reference || "refs/heads/master", // TODO: move default elsewhere
        repository,
      });
      break;
    }

    this.setState({
      directory: "",
      reference: "",
      repository: "",
    });
  }

  private handleDelete = ({ item: { id } }: { item: { id: string } }) => {
    this.setState({ showConfirmDelete: true, deleteId: id });
  }

  private handleCancelDelete = () => {
    this.setState({ showConfirmDelete: false });
  }

  private handleConfirmDelete = () => {
    deleteSource(this.props.relay.environment, this.state.deleteId);
    this.setState({ showConfirmDelete: false });
  }

}

export default createFragmentContainer(SourceListPage, graphql`
  fragment SourceListPage_system on System {
    lastMessageId
  }
  fragment SourceListPage_viewer on User {
    sources(first: 1000) @connection(key: "SourceListPage_sources") {
      edges {
        node {
          ...SourceList_items
        }
      }
    }
  }`,
);
