"use strict";

const ResourceModel = require("../models/resource.model");
const RoleModel = require("../models/role.model");
const { BadRequestError } = require("../core/error.response");
const { Schema } = require("mongoose");

const createResource = async ({ name = "profile", description = "" }) => {
  try {
    // 1. check resource is exist

    // 2. create resource
    const resource = await ResourceModel.create({
      res_name: name,
      res_description: description,
    });

    return resource;
  } catch (error) {
    return error;
  }
};

const resourceList = async ({ limit = 30, offset = 0, search = "" }) => {
  try {
    // 1. check admin ? middleware

    // 2. get resource list
    const resources = await ResourceModel.aggregate([
      {
        $project: {
          _id: 0,
          name: "$res_name",
          description: "$res_description",
          resourceId: "$_id",
          createAt: 1,
        },
      },
    ]);

    // 3. return resource list
    return resources;
  } catch (error) {
    return [];
  }
};

const createRole = async ({ name, description = "", grants = [] }) => {
  // 1.
  if (!name || grants.length === 0) {
    throw new BadRequestError("Invalid input");
  }

  try {
    // 1. check role is exist

    const filters = {
      role_name: name,
    };

    const opts = {
      upsert: true,
      new: true,
    };

    const update = {
      role_name: name,
      role_description: description,
      role_grants: grants,
    };

    // 2. create role
    const role = await RoleModel.findOneAndUpdate(filters, update, opts);

    return role;
  } catch (error) {
    console.log("error", error);
    throw new BadRequestError(
      "Invalid role name. It must be in ['ADMIN', 'USER']"
    );
  }
};

const roleList = async () => {
  try {
    // 2. get role list
    const roles = await RoleModel.aggregate([
      {
        $unwind: "$role_grants",
      },
      {
        $lookup: {
          from: "Resources",
          localField: "role_grants.resource",
          foreignField: "_id",
          as: "resource",
        },
      },
      {
        $unwind: "$resource",
      },
      {
        $project: {
          _id: 0,
          role: "$role_name",
          resource: "$resource.res_name",
          roleDescription: "$role_description",
          action: "$role_grants.actions",
          attributes: "$role_grants.attributes",
        },
      },
      {
        $unwind: "$action",
      },
      {
        $project: {
          _id: 0,
          role: 1,
          resource: 1,
          action: "$action",
          attributes: 1,
        },
      },
    ]);

    return roles;
  } catch (error) {
    return [];
  }
};

module.exports = {
  createRole,
  createResource,
  resourceList,
  roleList,
};
