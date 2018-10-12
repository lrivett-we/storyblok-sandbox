import BadFeature from "./blok/bad-feature";
import Feature from "./blok/feature";
import GlobePlaceable from "./blok/globe-placeable";
import GoodFeature from "./blok/good-feature";
import Grid from "./blok/grid";
import Teaser from "./blok/teaser";

import Page from "./content/page";
import WeirdPage from "./content/weird-page"

import Globe from "./global/globe";
import Toolbar from "./global/toolbar";

import deprecated from "./version/deprecated";

import { updateStoryblok } from "../storyblok-scripts/storyblok-update";

const components = {
  badFeature: BadFeature,
  feature: Feature,
  globe: GlobePlaceable,
  grid: Grid,
  teaser: Teaser,
  page: Page,
  globeGlobal: Globe,
  toolbar: Toolbar,
};

// updateStoryblok(components);

export default components;