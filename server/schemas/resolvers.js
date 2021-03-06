const { AuthenticationError } = require("apollo-server-express");
const { Profile, Park } = require("../models");
const { signToken } = require("../utils/auth");
const {
  getParks,
  getAlerts,
  getThingsToDo,
  getCampgrounds,
} = require("../utils/api");

const resolvers = {
  Query: {
    profiles: async () => {
      return await Profile.find();
    },
    findParks: async (parent, { park }) => {
      const parks = await getParks(park);
      console.log(parks);
      const newParks = await Park.insertMany(parks.data);
      return newParks;
    },
    profile: async (parent, { profileId }) => {
      return await Profile.findOne({ _id: profileId });
    },
    // By adding context to our query, we can retrieve the logged in user without specifically searching for them
    me: async (parent, args, context) => {
      if (context.user) {
        return Profile.findOne({ _id: context.user._id });
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },

  Mutation: {
    addProfile: async (parent, { name, email, password }) => {
      const profile = await Profile.create({ name, email, password });
      const token = signToken(profile);

      return { token, profile };
    },
    login: async (parent, { email, password }) => {
      const profile = await Profile.findOne({ email });

      if (!profile) {
        throw new AuthenticationError("No profile with this email found!");
      }

      const correctPw = await profile.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Incorrect password!");
      }

      const token = signToken(profile);
      return { token, profile };
    },

    // Add a third argument to the resolver to access data in our `context`
    addPark: async (parent, { parkCode }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { parks: parkCode },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in!");
    },

    addThingsToDo: async (parent, { id }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: context.user._id },
          {
            $addToSet: { thingsToDo: id },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in!");
    },

    addCampground: async (parent, { profileId, campground }, context) => {
      // If context has a `user` property, that means the user executing this mutation has a valid JWT and is logged in
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: profileId },
          {
            $addToSet: { campgrounds: campground },
          },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      // If user attempts to execute this mutation and isn't logged in, throw an error
      throw new AuthenticationError("You need to be logged in!");
    },

    // Set up mutation so a logged in user can only remove their profile and no one else's
    // removeProfile: async (parent, args, context) => {
    //   if (context.user) {
    //     return Profile.findOneAndDelete({ _id: context.user._id });
    //   }
    //   throw new AuthenticationError('You need to be logged in!');
    // },

    // Make it so a logged in user can only remove a park from their own profile
    removePark: async (parent, { park }, context) => {
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { parks: park } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    removeThingsToDo: async (parent, { ThingsToDo }, context) => {
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { ThingsToDos: ThingsToDo } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },

    removeCampground: async (parent, { campground }, context) => {
      if (context.user) {
        return Profile.findOneAndUpdate(
          { _id: context.user._id },
          { $pull: { campgrounds: campground } },
          { new: true }
        );
      }
      throw new AuthenticationError("You need to be logged in!");
    },
  },
};

module.exports = resolvers;
