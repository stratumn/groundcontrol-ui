
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

import React from "react";
import {
  Container,
  Header,
  Icon,
  SemanticICONS,
} from "semantic-ui-react";

import "./Page.css";

export interface IProps {
  className?: string;
  icon: SemanticICONS;
  header: string;
  subheader: string;
  children: React.ReactNode;
}

const Page = ({
  className,
  icon,
  header,
  subheader,
  children,
}: IProps) => (
  <div className={`Page ${className || ""}`}>
    <Header as="h1">
      <Icon name={icon} />
      <Header.Content>
        {header}
        <Header.Subheader>{subheader}</Header.Subheader>
      </Header.Content>
    </Header>
    <Container fluid={true}>
      {children}
    </Container>
  </div>
);

export default Page;
