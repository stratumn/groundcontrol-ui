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
import { createPaginationContainer, RelayPaginationProp } from "react-relay";
import { Disposable } from "relay-runtime";
import { Button } from "semantic-ui-react";

import { ServiceListPage_system } from "./__generated__/ServiceListPage_system.graphql";
import { ServiceListPage_viewer } from "./__generated__/ServiceListPage_viewer.graphql";

import Page from "../components/Page";
import ServiceFilter, { IProps as IServiceFilterProps } from "../components/ServiceFilter";
import ServiceProgressModal from "../components/ServiceProgressModal";
import ServiceTable from "../components/ServiceTable";
import { IProps as IServiceTableRowProps } from "../components/ServiceTableRow";
import { IVariable } from "../components/VariableForm";
import { IProps as IVariableFormProps} from "../components/VariableForm";
import { IProps as IVariableFormFieldProps} from "../components/VariableFormField";
import VariableFormModal from "../components/VariableFormModal";
import { commit as startService } from "../mutations/startService";
import { commit as stopService } from "../mutations/stopService";
import { subscribe as subscribeStored } from "../subscriptions/serviceStored";

import "./ServiceListPage.css";

export interface IProps {
  relay: RelayPaginationProp;
  router: Router;
  system: ServiceListPage_system;
  viewer: ServiceListPage_viewer;
  params: {
    status?: string;
  };
}

interface IState {
  showVariableModal: boolean;
  showServiceProgressModal: boolean;
  serviceID?: string;
  variables?: IVariable[];
}

export class ServiceListPage extends Component<IProps, IState> {

  public state: IState = {
    showServiceProgressModal: false,
    showVariableModal: false,
  };

  private disposables: Disposable[] = [];

  public render() {
    const items = this.props.viewer.services.edges.map(({ node }) => node);

    const {
      serviceID,
      showVariableModal,
      showServiceProgressModal,
      variables,
    } = this.state;

    let modal: JSX.Element | null = null;

    if (showVariableModal && variables) {
      modal = (
        <VariableFormModal
          variables={variables}
          onClose={this.handleCloseVariableModal}
          onChangeVariable={this.handleChangeVariable}
          onSubmit={this.handleSubmitVariables}
        />
      );
    } else if (showServiceProgressModal && serviceID) {
      modal = (
        <ServiceProgressModal
          item={this.findService(serviceID)!}
          onClose={this.handleCloseServiceProgressModal}
        />
      );
    }

    return (
      <Page
        header="Services"
        subheader="Services are processes that run in the background indefinitely."
        icon="list"
        className="ServiceListPage"
        fullWidth={true}
      >
        <ServiceFilter
          status={this.getStatus()}
          onChange={this.handleStatusChange}
        />
        <ServiceTable
          items={items}
          onStart={this.handleStart}
          onStop={this.handleStop}
        />
        <Button
          disabled={!this.props.relay.hasMore() || this.props.relay.isLoading()}
          loading={this.props.relay.isLoading()}
          color="grey"
          onClick={this.handleLoadMore}
        >
          Load More
        </Button>
        {modal}
      </Page>
    );
  }

  public componentDidMount() {
    const environment = this.props.relay.environment;
    const lastMessageId = this.props.system.lastMessageId;
    this.disposables.push(subscribeStored(environment, this.getStatus, lastMessageId));
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private getStatus = () => this.props.params.status === undefined ?
    undefined : this.props.params.status.split(",")

  private findService(id: string) {
    const edge = this.props.viewer.services.edges.find((value) => {
      return value.node.id === id;
    });

    if (edge) {
      return edge.node;
    }
  }

  private doesServiceHaveVariables(id: string) {
    const service = this.findService(id);

    if (service) {
      return service.allVariables.edges.length > 0;
    }

    return false;
  }

  private setVariables(vars: Array<{name: string, default: string | null}>) {
    const keys = this.props.viewer.keys.edges.map(({ node }) => node);
    const keyMap: { [name: string]: string } = {};

    for (const key of keys) {
      keyMap[key.name] = key.value;
    }

    const variables: IVariable[] = vars.map((item) => ({
      name: item.name,
      save: true,
      value: keyMap[item.name] || item.default || "",
    }));

    this.setState({ variables });
  }

  private handleStatusChange = ({ status }: IServiceFilterProps) => {
    if (!status || status.length < 1 || status.length > 4) {
      return this.props.router.replace("/services");
    }

    this.props.router.replace(`/services/${status.join(",")}`);
  }

  private handleStart = ({ item: { id: serviceID } }: IServiceTableRowProps) => {
    if (!this.doesServiceHaveVariables(serviceID)) {
      this.setState({ serviceID, showServiceProgressModal: true });
      startService(this.props.relay.environment, serviceID);
    }

    const service = this.findService(serviceID);
    if (!service) {
      return;
    }

    const vars = service.allVariables.edges.map(({ node }) => node);

    this.setState({ serviceID, showVariableModal: true });
    this.setVariables(vars);
  }

  private handleStop = ({ item: { id } }: IServiceTableRowProps) => {
    stopService(this.props.relay.environment, id);
  }

  private handleCloseVariableModal = () => {
    this.setState({ showVariableModal: false });
  }

  private handleCloseServiceProgressModal = () => {
    this.setState({ showServiceProgressModal: false });
  }

  private handleChangeVariable = ({ name, value, save }: IVariableFormFieldProps) => {
    const variables = this.state.variables!.map((v) => ({...v}));

    for (const variable of variables) {
      if (variable.name === name) {
        variable.value = value;
        variable.save = save;
        break;
      }
    }

    this.setState({ variables });
  }

  private handleSubmitVariables = ({ variables }: IVariableFormProps ) => {
    const { serviceID } = this.state;

    if (serviceID) {
      this.setState({ showServiceProgressModal: true });
      startService(this.props.relay.environment, serviceID, variables);
    }

    this.handleCloseVariableModal();
  }

  private handleLoadMore = () => {
    this.props.relay.loadMore(
      50,
      (err) => {
        if (err) {
          console.log(err);
        }

        // Make sure load more button updates.
        this.forceUpdate();
      },
    );
  }
}

export default createPaginationContainer(
  ServiceListPage,
  graphql`
    fragment ServiceListPage_system on System {
      lastMessageId
    }
    fragment ServiceListPage_viewer on User
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 50},
        cursor: {type: "String"},
        status: { type: "[ServiceStatus!]", defaultValue: null },
      ) {
      services(
       first: $count,
       after: $cursor,
       status: $status,
      )
        @connection(
          key: "ServiceListPage_services",
          filters: ["status"],
        ) {
        edges {
          node {
            id
            allVariables {
              edges {
                node {
                  name
                  default
                }
              }
            }
            ...ServiceTable_items
            ...ServiceProgressModal_item
          }
        }
      }
      keys {
        edges {
          node {
            name
            value
          }
        }
      }
    }`,
  {
    direction: "forward",
    getConnectionFromProps: (props) => props.viewer && props.viewer.services,
    getVariables: (_, {count, cursor}, fragmentVariables) => ({
      count,
      cursor,
      status: fragmentVariables.status,
    }),
    query: graphql`
      query ServiceListPagePaginationQuery(
        $count: Int!,
        $cursor: String,
        $status: [ServiceStatus!],
      ) {
        viewer {
          ...ServiceListPage_viewer @arguments(
            count: $count,
            cursor: $cursor,
            status: $status,
          )
        }
      }
    `,
  },
);
