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
import React, { Fragment } from "react";
import { createFragmentContainer } from "react-relay";
import { Progress } from "semantic-ui-react";

import { ServiceProgress_item } from "./__generated__/ServiceProgress_item.graphql";

export interface IProps {
  item: ServiceProgress_item;
}

export function ServiceProgress({ item: { dependencies } }: IProps) {
  const services = dependencies.edges.map(({ node }) => node);
  const running = services.filter((node) => node.status === "RUNNING");
  let current = services.find((service) => service.status !== "RUNNING");

  if (!current) {
    current = services[services.length - 1];
  }

  return (
    <Fragment>
      <Progress
        value={Math.min(running.length + 1, services.length)}
        total={services.length}
        progress="ratio"
        active={current.status === "STARTING"}
        warning={current.status === "STOPPED"}
        error={current.status === "FAILED"}
        success={current.status === "RUNNING"}
        label={`${current.name} ${current.status}`}
      />
    </Fragment>
  );
}

export default createFragmentContainer(ServiceProgress, graphql`
  fragment ServiceProgress_item on Service {
    dependencies {
      edges {
        node {
          name
          status
        }
      }
    }
  }`,
);
