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
import { Segment } from "semantic-ui-react";

import { KeyListPage_system } from "./__generated__/KeyListPage_system.graphql";
import { KeyListPage_viewer } from "./__generated__/KeyListPage_viewer.graphql";

import KeyList from "../components/KeyList";
import { IProps as IKeyListItemProps } from "../components/KeyListItem";
import Page from "../components/Page";
import SetKeyForm, { IProps as ISetKeyFormProps } from "../components/SetKeyForm";
import { commit as deleteKey } from "../mutations/deleteKey";
import { commit as setKey } from "../mutations/setKey";
import { subscribe as subscribeKeyDeleted } from "../subscriptions/keyDeleted";
import { subscribe as subscribeKeyUpserted } from "../subscriptions/keyUpserted";

export interface IProps {
  relay: RelayProp;
  system: KeyListPage_system;
  viewer: KeyListPage_viewer;
}

interface IState {
  name: string;
  value: string;
}

export class KeyListPage extends Component<IProps, IState> {

  public state: IState = {
    name: "",
    value: "",
  };

  private formRef: React.RefObject<SetKeyForm>;
  private disposables: Disposable[] = [];

  constructor(props: IProps) {
    super(props);
    this.formRef = React.createRef();
  }

  public render() {
    const items = this.props.viewer.keys.edges.map(({ node }) => node);

    return (
      <Page
        header="Keys"
        subheader="A key holds a value that can be used by tasks."
        icon="key"
      >
        <Segment>
          <h3>Add or Replace a Key</h3>
          <SetKeyForm
            {...this.state}
            ref={this.formRef}
            onSubmit={this.handleSubmit}
            onChange={this.handleChange}
          />
        </Segment>
        <Segment>
          <h3>Current Keys</h3>
          <KeyList
            items={items}
            onEdit={this.handleEdit}
            onDelete={this.handleDelete}
          />
        </Segment>
      </Page>
    );
  }

  public componentDidMount() {
    const { relay: { environment }, system: { lastMessageId } } = this.props;

    this.disposables.push(
      subscribeKeyUpserted(environment, lastMessageId),
      subscribeKeyDeleted(environment, lastMessageId),
    );
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private handleChange = (values: ISetKeyFormProps) => {
    this.setState(values);
  }

  private handleSubmit = (values: ISetKeyFormProps) => {
    const { name, value } = values;

    setKey(this.props.relay.environment, {
      name,
      value,
    });

    this.setState({
      name: "",
      value: "",
    });

    if (this.formRef.current) {
      this.formRef.current.selectName();
    }
  }

  private handleEdit = ({ item: { name, value } }: IKeyListItemProps) => {
    this.setState({
      name,
      value,
    });

    window.scrollTo(0, 0);

    if (this.formRef.current) {
      this.formRef.current.selectValue();
    }
  }

  private handleDelete = ({ item: { id } }: IKeyListItemProps) => {
    deleteKey(this.props.relay.environment, id);
  }

}

export default createFragmentContainer(KeyListPage, graphql`
  fragment KeyListPage_system on System {
    lastMessageId
  }
  fragment KeyListPage_viewer on User {
    keys(first: 1000) @connection(key: "KeyListPage_keys") {
      edges {
        node {
          ...KeyList_items
        }
      }
    }
  }`,
);
