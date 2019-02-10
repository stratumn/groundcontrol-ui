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
import { Container, Loader } from "semantic-ui-react";

import { LogEntryListPage_system } from "./__generated__/LogEntryListPage_system.graphql";
import { LogEntryListPage_viewer } from "./__generated__/LogEntryListPage_viewer.graphql";

import LogEntryFilter, { IProps as ILogEntryFilterProps } from "../components/LogEntryFilter";
import LogEntryTable from "../components/LogEntryTable";

import { subscribe } from "../subscriptions/logEntryAdded";

import "./LogEntryListPage.css";

export interface IProps {
  relay: RelayPaginationProp;
  router: Router;
  viewer: LogEntryListPage_viewer;
  system: LogEntryListPage_system;
  params: {
    status?: string;
    ownerId?: string;
  };
}

export class LogEntryListPage extends Component<IProps> {

  private disposables: Disposable[] = [];

  private prevScrollY = 0;
  private previousScrollHeight = 0;
  private shouldScrollDown = false;

  public render() {
    const items = this.props.system.logEntries.edges.map(({ node }) => node);
    const status = this.props.params.status === undefined ? undefined :
      this.props.params.status.split(",");
    const { ownerId } = this.props.params;
    const projects = this.props.viewer.projects.edges.map(({ node }) => node);
    const isLoading = this.props.relay.isLoading();

    return (
      <Container
        className="LogEntryListPage"
        fluid={true}
      >
        <Loader
          inverted={true}
          active={isLoading}
        />
        <LogEntryFilter
          status={status}
          projects={projects}
          ownerId={ownerId}
          onChange={this.handleFiltersChange}
        />
        <LogEntryTable items={items} />
      </Container>
    );
  }

  public componentDidMount() {
    const { relay: { environment }, system: { lastMessageId } } = this.props;

    document.addEventListener("scroll", this.handleScroll);
    window.scrollTo(0, document.body.scrollHeight);
    this.previousScrollHeight = document.body.scrollHeight;

    this.disposables.push(
      {
        dispose: () => {
          document.removeEventListener("scroll", this.handleScroll);
        },
      },
      subscribe(environment, lastMessageId),
    );

  }

  public componentDidUpdate() {
    if (this.shouldScrollDown) {
      window.scrollTo(0, document.body.scrollHeight);
    }

    this.previousScrollHeight = document.body.scrollHeight;
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private loadMore() {
    const disposable = this.props.relay.loadMore(
      100,
      (err) => {
        if (err) {
          console.log(err);
        }

        const { scrollY } = window;
        const { scrollHeight } = document.body;

        if (this.previousScrollHeight < scrollHeight) {
          window.scrollTo(0, scrollY + scrollHeight - this.previousScrollHeight);
        }

        this.previousScrollHeight = scrollHeight;

        // To hide loader.
        this.forceUpdate();
      },
    );

    if (disposable) {
      this.disposables.push(disposable);
    }

    // To show loader.
    this.forceUpdate();
  }

  private handleFiltersChange = ({ status, ownerId }: ILogEntryFilterProps) => {
    if (!status || (status.length < 1 || status.length > 3)) {
      if (!ownerId) {
        return this.props.router.replace("/logs");
      }
      return this.props.router.replace(`/logs/;${ownerId}`);
    }

    this.props.router.replace(`/logs/${status.join(",")};${ownerId || ""}`);
  }

  private handleScroll = () => {
    const { scrollY, innerHeight } = window;
    const { scrollHeight } = document.body;

    this.shouldScrollDown = scrollY + innerHeight >= scrollHeight;

    const prevScrollY = this.prevScrollY;
    this.prevScrollY = scrollY;

    if (prevScrollY < scrollY) {
      return;
    }

    const relay = this.props.relay;

    if (!relay.hasMore()) {
      return;
    }

    if (relay.isLoading()) {
      return;
    }

    if (scrollY > innerHeight) {
      return;
    }

    this.previousScrollHeight = scrollHeight;

    this.loadMore();
  }

}

export default createPaginationContainer(
  LogEntryListPage,
  graphql`
    fragment LogEntryListPage_system on System
      @argumentDefinitions(
        count: {type: "Int", defaultValue: 100},
        cursor: {type: "String"},
        level: { type: "[LogLevel!]", defaultValue: null },
        ownerId: { type: "ID", defaultValue: null }
      ) {
      lastMessageId
      logEntries(
       last: $count,
       before: $cursor,
       level: $level,
       ownerId: $ownerId,
      )
        @connection(
          key: "LogEntryListPage_logEntries",
          filters: ["level", "ownerId"],
        ) {
        edges {
          node {
            ...LogEntryTable_items
            id
          }
        }
      }
    }
    fragment LogEntryListPage_viewer on User {
      projects {
        edges {
          node {
            ...LogEntryFilter_projects
          }
        }
      }
    }`,
  {
    direction: "backward",
    getConnectionFromProps: (props) => props.system && props.system.logEntries,
    getVariables: (_, {count, cursor}, fragmentVariables) => ({
      count,
      cursor,
      level: fragmentVariables.level,
      ownerId: fragmentVariables.ownerId,
    }),
    query: graphql`
      query LogEntryListPagePaginationQuery(
        $count: Int!,
        $cursor: String,
        $level: [LogLevel!],
        $ownerId: ID,
      ) {
        system {
          ...LogEntryListPage_system @arguments(
            count: $count,
            cursor: $cursor,
            level: $level,
            ownerId: $ownerId,
          )
        }
      }
    `,
  },
);
