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
import { BrowserProtocol, queryMiddleware } from "farce";
import {
  createFarceRouter,
  createRender,
  makeRouteConfig,
  Redirect,
  Route,
  RouteRenderArgs,
} from "found";
import React from "react";

import Loading from "./components/Loading";
import App from "./containers/App";
import ErrorPage from "./containers/ErrorPage";
import HttpErrorPage from "./containers/HttpErrorPage";
import JobListPage from "./containers/JobListPage";
import KeyListPage from "./containers/KeyListPage";
import LogEntryListPage from "./containers/LogEntryListPage";
import ServiceListPage from "./containers/ServiceListPage";
import SourceListPage from "./containers/SourceListPage";
import WorkspaceListPage from "./containers/WorkspaceListPage";
import WorkspaceViewPage from "./containers/WorkspaceViewPage";

const appQuery = graphql`
  query RouterAppQuery {
    system {
      ...App_system
    }
  }
`;

const workspaceListQuery = graphql`
  query RouterWorkspaceListQuery {
    system {
      ...WorkspaceListPage_system
    }
    viewer {
      ...WorkspaceListPage_viewer
    }
  }
`;

const sourceListQuery = graphql`
  query RouterSourceListQuery {
    system {
      ...SourceListPage_system
    }
    viewer {
      ...SourceListPage_viewer
    }
  }
`;

const keyListQuery = graphql`
  query RouterKeyListQuery {
    system {
      ...KeyListPage_system
    }
    viewer {
      ...KeyListPage_viewer
    }
  }
`;

const workspaceViewQuery = graphql`
  query RouterWorkspaceViewQuery($slug: String!) {
    system {
      ...WorkspaceViewPage_system
    }
    viewer {
      ...WorkspaceViewPage_viewer @arguments(slug: $slug)
    }
  }
`;

const serviceListQuery = graphql`
  query RouterServiceListQuery($status: [ServiceStatus!]) {
    system {
      ...ServiceListPage_system
    }
    viewer {
      ...ServiceListPage_viewer @arguments(status: $status)
    }
  }
`;

const jobListQuery = graphql`
  query RouterJobListQuery($status: [JobStatus!]) {
    system {
      ...JobListPage_system @arguments(status: $status)
    }
  }
`;

const logEntryListQuery = graphql`
  query RouterLogEntryListQuery($level: [LogLevel!], $ownerId: ID) {
    system {
      ...LogEntryListPage_system @arguments(level: $level, ownerId: $ownerId)
    }
    viewer {
      ...LogEntryListPage_viewer
    }
  }
`;

function prepareServiceListVariables({ status }: { status: string }) {
  return { status: status ? status.split(",") : null };
}

function prepareJobListVariables({ status }: { status: string }) {
  return { status: status ? status.split(",") : null };
}

function prepareLogEntryListVariables({ level, ownerId }: { level: string, ownerId?: string }) {
  return { level: level ? level.split(",") : null, ownerId };
}

function render(args: RouteRenderArgs) {
  if (args.error) {
    return <ErrorPage error={args.error} />;
  }

  if (args.Component && args.props) {
    return <args.Component {...args.props} />;
  }

  return <Loading />;
}

export default createFarceRouter({
  historyMiddlewares: [queryMiddleware],
  historyProtocol: new BrowserProtocol(),
  routeConfig: makeRouteConfig(
    <Route
      path="/"
      Component={App}
      query={appQuery}
    >
      <Redirect from="/" to="/workspaces" />
      <Route path="workspaces">
        <Route
          Component={WorkspaceListPage}
          query={workspaceListQuery}
          render={render}
        />
        <Route
          path=":slug"
          Component={WorkspaceViewPage}
          query={workspaceViewQuery}
          render={render}
        />
      </Route>
      <Route
        path="sources"
        Component={SourceListPage}
        query={sourceListQuery}
        render={render}
      />
      <Route
        path="keys"
        Component={KeyListPage}
        query={keyListQuery}
        render={render}
      />
      <Route path="services">
        <Route
          Component={ServiceListPage}
          query={serviceListQuery}
          render={render}
        />
        <Route
          path=":status"
          Component={ServiceListPage}
          query={serviceListQuery}
          prepareVariables={prepareServiceListVariables}
          render={render}
        />
      </Route>
      <Route path="jobs">
        <Route
          Component={JobListPage}
          query={jobListQuery}
          render={render}
        />
        <Route
          path=":status"
          Component={JobListPage}
          query={jobListQuery}
          prepareVariables={prepareJobListVariables}
          render={render}
        />
      </Route>
      <Route path="logs">
        <Route
          Component={LogEntryListPage}
          query={logEntryListQuery}
          render={render}
        />
        <Route
          path=":level?;:ownerId?"
          Component={LogEntryListPage}
          query={logEntryListQuery}
          prepareVariables={prepareLogEntryListVariables}
          render={render}
        />
      </Route>
    </Route>,
  ),

  render: createRender({
    renderError: ({ error }) => <HttpErrorPage error={error} />,
  }),

});
