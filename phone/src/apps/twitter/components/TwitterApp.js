import React, { useState, useEffect } from "react";
import { Switch, Route } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import Nui from "../../../os/nui-events/utils/Nui";
import { AppWrapper } from "../../../ui/components";
import { AppContent } from "../../../ui/components/AppContent";
import TweetListContainer from "./tweet/TweetListContainer";
import AddTweetModal from "./AddTweetModal";
import { useModal } from "../hooks/useModal";
import { useProfile } from "../hooks/useProfile";
import TweetButton from "./buttons/TweetButton";
import TwitterTitle from "./TwitterTitle";
import BottomNavigation from "./BottomNavigation";
import TwitterProfile from "./profile/Profile";
import AlertBar from "./alerts/AlertBar";
import TwitterSearch from "./TwitterSearch";

import "./twitter.css";
import "emoji-mart/css/emoji-mart.css";

const useStyles = makeStyles((theme) => ({
  backgroundModal: {
    background: "black",
    opacity: "0.6",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 5,
  },
}));

// TODO move this to the router so the application back button works
const PAGE_COMPONENT_MAPPING = {
  0: <TweetListContainer />,
  1: <TwitterSearch />,
  2: <TwitterProfile />,
};
const TWEETS_REFRESH_RATE = 15000; // TODO move this to twitter config

export const TwitterApp = () => {
  const classes = useStyles();
  const { modalVisible, setModalVisible } = useModal();
  const [activePage, setActivePage] = useState(0);

  useEffect(() => {
    Nui.send("phone:getOrCreateTwitterProfile", {});
    Nui.send("phone:fetchTweets", {});

    // this is a polling implementation. It is possible that
    // there is some interaction where, on a new tweet, all
    // clients are sent the updated query data. Until that can
    // be accomplished this is naive but robust.
    //
    // TODO don't call fetchTweets - implement a function that only
    // returns tweets that we don't already have
    const timeout = window.setTimeout(() => {
      Nui.send("phone:fetchTweets", {});
    }, TWEETS_REFRESH_RATE);
    return () => window.clearTimeout(timeout);
  }, []);

  const openModal = () => setModalVisible(true);
  const handlePageChange = (e, page) => setActivePage(page);
  const showTweetButton = activePage === 0;

  return (
    <AppWrapper id="twitter-app">
      <AddTweetModal />
      <div className={modalVisible ? classes.backgroundModal : null} />
      <TwitterTitle />
      <AppContent>
        <Switch>
          <Route path="/twitter" exact component={TweetListContainer} />
          <Route path="/twitter/search" component={TwitterSearch} />
          <Route path="/twitter/profile" component={TwitterProfile} />
        </Switch>
      </AppContent>
      {showTweetButton && <TweetButton openModal={openModal} />}
      <AlertBar />
      <BottomNavigation
        activePage={activePage}
        handleChange={handlePageChange}
      />
    </AppWrapper>
  );
};
