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
import { Link } from "found";
import React, { Fragment } from "react";
import { createFragmentContainer } from "react-relay";
import {
  Label,
  Menu,
} from "semantic-ui-react";

import { MenuSecondaryItems_jobMetrics } from "./__generated__/MenuSecondaryItems_jobMetrics.graphql";
import { MenuSecondaryItems_logMetrics } from "./__generated__/MenuSecondaryItems_logMetrics.graphql";
import { MenuSecondaryItems_serviceMetrics } from "./__generated__/MenuSecondaryItems_serviceMetrics.graphql";

import { GroundControlPort } from "../constants";

export interface IProps {
  serviceMetrics: MenuSecondaryItems_serviceMetrics;
  jobMetrics: MenuSecondaryItems_jobMetrics;
  logMetrics: MenuSecondaryItems_logMetrics;
}

export function MenuSecondaryItems({
  serviceMetrics,
  jobMetrics,
  logMetrics,
}: IProps) {
  const servicesLabel = !!serviceMetrics.running && (
    <Label
      color="blue"
      size="tiny"
    >
      {serviceMetrics.running}
    </Label>
  );
  const jobsLabel = !!(jobMetrics.queued || jobMetrics.running) && (
    <Label
      color="blue"
      size="tiny"
    >
      {jobMetrics.queued + jobMetrics.running}
    </Label>
  );
  const logsLabel = !!logMetrics.error && (
    <Label
      color="pink"
      size="tiny"
    >
      {logMetrics.error}
    </Label>
  );
  return (
    <Fragment>
      <Link
        to="/services"
        Component={Menu.Item}
        activePropName="active"
      >
        Services {servicesLabel}
      </Link>
      <Link
        to="/jobs"
        Component={Menu.Item}
        activePropName="active"
      >
        Jobs {jobsLabel}
      </Link>
      <Link
        to="/logs"
        Component={Menu.Item}
        activePropName="active"
      >
        Logs {logsLabel}
      </Link>
      <Menu.Item href={`http://localhost:${GroundControlPort}/graphql`}>
        GraphQL
      </Menu.Item>
    </Fragment>
  );
}

export default createFragmentContainer(MenuSecondaryItems, graphql`
  fragment MenuSecondaryItems_serviceMetrics on ServiceMetrics {
    running
  }
  fragment MenuSecondaryItems_jobMetrics on JobMetrics {
    queued
    running
  }
  fragment MenuSecondaryItems_logMetrics on LogMetrics {
    error
  }
`);
