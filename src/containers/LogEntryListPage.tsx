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
import { createPaginationContainer, RelayPaginationProp } from "react-relay";
import { Disposable } from "relay-runtime";
import { Container, Loader } from "semantic-ui-react";

import { LogEntryListPage_system } from "./__generated__/LogEntryListPage_system.graphql";
import { LogEntryListPage_viewer } from "./__generated__/LogEntryListPage_viewer.graphql";

import LogEntryFilter, { IProps as ILogEntryFilterProps } from "../components/LogEntryFilter";
import { IProps as ILogEntryMessageProps } from "../components/LogEntryMessage";
import LogEntryTable from "../components/LogEntryTable";

import { commit as openEditor } from "../mutations/openEditor";
import { subscribe } from "../subscriptions/logEntryAdded";

import "./LogEntryListPage.css";

export interface IProps {
  relay: RelayPaginationProp;
  router: Router;
  viewer: LogEntryListPage_viewer;
  system: LogEntryListPage_system;
  params: {
    level?: string;
    ownerId?: string;
  };
}

export class LogEntryListPage extends Component<IProps> {

  private disposables: Disposable[] = [];

  private shouldScrollToBottom = false;
  private prevScrollHeight = 0;
  private scrollHeightIncrease = 0;
  private prevScrollY = 0;

  public render() {
    const items = this.props.system.logEntries.edges.map(({ node }) => node);
    const { ownerId } = this.props.params;
    const projects = this.props.viewer.projects.edges.map(({ node }) => node);
    const isLoading = this.props.relay.isLoading();

    return (
      <Container
        className="LogEntryListPage"
        fluid={true}
      >
        <Helmet>
          <body className="inverted" />
        </Helmet>
        <Loader
          inverted={true}
          active={isLoading}
        />
        <LogEntryFilter
          level={this.getLevel()}
          projects={projects}
          ownerId={ownerId}
          onChange={this.handleFiltersChange}
        />
        <LogEntryTable
          items={items}
          onClickSourceFile={this.handleClickSourceFile}
        />
      </Container>
    );
  }

  public componentDidMount() {
    const { relay: { environment }, system: { lastMessageId } } = this.props;

    this.prevScrollHeight = document.body.scrollHeight;
    document.addEventListener("scroll", this.handleScroll);
    window.scrollTo(0, document.body.scrollHeight);

    this.disposables.push(
      {
        dispose: () => {
          document.removeEventListener("scroll", this.handleScroll);
        },
      },
      subscribe(
        environment,
        this.getLevel,
        () => this.props.params.ownerId,
        lastMessageId,
      ),
    );
  }

  public componentDidUpdate() {
    // If the user was at the bottom of the window, scroll all the way
    // down.
    if (this.shouldScrollToBottom) {
      window.scrollTo(0, document.body.scrollHeight);
    }

    // Keep track how much the height of the document increased because
    // we might need to scroll to compensate.
    const { scrollHeight } = document.body;
    this.scrollHeightIncrease = scrollHeight - this.prevScrollHeight;
    this.prevScrollHeight = scrollHeight;
  }

  public componentWillUnmount() {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }

    this.disposables = [];
  }

  private getLevel = () => this.props.params.level === undefined ?
    undefined : this.props.params.level.split(",")

  private isChrome = () => "chrome" in window;

  private loadMore() {
    const disposable = this.props.relay.loadMore(
      100,
      (err) => {
        if (err) {
          console.log(err);
        }

        this.scrollDownAfterNewPage();

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

  // On most browsers, after new entries are added to the begining of the page,
  // we need to scroll the window so that it shows the same entries as before.
  private scrollDownAfterNewPage() {
    if (this.isChrome()) {
      // Chrome already scrolls down.
      return;
    }

    window.scrollBy(0, this.scrollHeightIncrease);
  }

  private handleScroll = () => {
    const { scrollY, innerHeight } = window;
    const { scrollHeight } = document.body;

    // Check if the user is at the bottom of the window.
    this.shouldScrollToBottom = scrollY + innerHeight >= scrollHeight - 1 ||
      scrollHeight < innerHeight;

    const prevScrollY = this.prevScrollY;
    this.prevScrollY = scrollY;

    // Don't load a page if scrolling down.
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

    // Load a page as soon as there is less than one window worth of entries left.
    if (scrollY > innerHeight) {
      return;
    }

    this.loadMore();
  }

  private handleFiltersChange = ({ level, ownerId }: ILogEntryFilterProps) => {
    if (!level || (level.length < 1 || level.length > 3)) {
      if (!ownerId) {
        return this.props.router.replace("/logs");
      }
      return this.props.router.replace(`/logs/;${ownerId}`);
    }

    this.props.router.replace(`/logs/${level.join(",")};${ownerId || ""}`);
  }

  private handleClickSourceFile = ({ item: { sourceFile } }: ILogEntryMessageProps) => {
    openEditor(this.props.relay.environment, sourceFile!);
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
