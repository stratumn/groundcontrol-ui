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

import { TaskProgress_item } from "./__generated__/TaskProgress_item.graphql";

export interface IProps {
  item: TaskProgress_item;
}

export function TaskProgress({
  item: {
    status,
    steps,
    currentStep,
    currentProject,
    currentCommand,
  },
}: IProps) {
  const stepNodes = steps.edges.map(({ node }) => node);

  let currentIndex = 0;

  if (currentStep) {
    currentIndex = stepNodes.findIndex(({ id }) => id === currentStep.id);
  }

  let label = "";

  if (currentProject) {
    label += currentProject.slug + " > ";
  }

  if (currentCommand) {
    label += currentCommand.command;
  }

  return (
    <Fragment>
      <Progress
        value={Math.min(currentIndex + 1, stepNodes.length)}
        total={stepNodes.length}
        progress="ratio"
        active={status !== "STOPPED" && status !== "FAILED"}
        error={status === "FAILED"}
        success={status === "STOPPED"}
        label={label}
      />
    </Fragment>
  );
}

export default createFragmentContainer(TaskProgress, graphql`
  fragment TaskProgress_item on Task {
    status
    steps {
      edges {
        node {
          id
        }
      }
    }
    currentStep {
      id
    }
    currentProject {
      slug
    }
    currentCommand {
      command
    }
  }`,
);
