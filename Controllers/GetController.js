const Property = require("../Schema/Property/PropertySchema");
const Propertytype = require("../Schema/Common/PropertyTypeSchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");
const Roomview = require("../Schema/Common/RoomviewSchema");
const Bedview = require("../Schema/Common/BedviewSchema");
const Measurement = require("../Schema/Common/MeasurementSchema");
const Amenities = require("../Schema/Common/AmenitiesSchema");
const AmenitiesCategory = require("../Schema/Common/AmenitiesCategorySchema");
const Transport = require("../Schema/Common/TransportSchema");
const User = require("../Schema/Property/UserSchema");
const Rate = require("../Schema/Property/RateMasterSchema");
const AmenitiesMaster = require("../Schema/Property/AmenitiesMasterSchema");
const Inventory = require("../Schema/Property/InventorySchema");
const BookingSchema = require("../Schema/Common/BookingSchema");
const BookingDet = require("../Schema/Bookings/BookingDet");
const BookingMas = require("../Schema/Bookings/BookingMas");
const BookingDetDatewise = require("../Schema/Bookings/BookingDetDatewise");
const BookingPerDayRent = require("../Schema/Bookings/BookingPerDateRent");
const PolicyMaster = require("../Schema/Property/PolicyMasterSchema");
const UserProperty = require("../Schema/Common/UserPropertySchema");
const Currency = require("../Schema/Common/CurrencySchema");
const IDProof = require("../Schema/Common/IDProofSchema");
const PriceFilter = require("../Schema/Common/PriceFilterSchema");
const Ratings = require("../Schema/Property/RatingsSchema");
const RatePlan = require("../Schema/Property/RatePlanSchema");
const RoomRateLink = require("../Schema/Property/RoomRateLinkSchema");
const GuestDetail = require("../Schema/Property/GuestDetailsSchema");
const GuestEmail = require("../Schema/Property/GuestEmailSchema");
const PolicyType = require("../Schema/Common/PolicyTypeSchema");
const RatingsNumber = require("../Schema/Common/RatingsNumberSchema");
const Templatetype = require("../Schema/Common/TemplateTypeSchema");
const ImageCategory = require("../Schema/Common/ImageCategory");
const Managementtype = require("../Schema/Common/ManagementType");
const Email = require("../Schema/Property/EmailSchema");
const EmailMaster = require("../Schema/Property/EmailMasterSchema");
const Conference = require("../Schema/Property/ConferenceRoom");
const Purpose = require("../Schema/Common/BlockhallPurposeSchema");
const BlockHall = require("../Schema/Property/Block_Hall/BlockHallSchema");
const BlockHallDet = require("../Schema/Property/Block_Hall/BlockHallDet");
const Utility = require("../Schema/Property/UtilitySchema");
const Ota = require("../Schema/Property/OtaSchema");
const PropertyOwner = require("../Schema/Property/PropertyOwnerType");
const WebCancellation = require("../Schema/Web/CancellationPolicy");
const Web = require("../Schema/Web/WebSchema");
const WebRoom = require("../Schema/Web/RoomTypes");
const WebRoomOccupancy = require("../Schema/Web/RoomOccupancy");
const WebRoomAmenities = require("../Schema/Web/RoomAmenities");
const WebMealPackage = require("../Schema/Web/MealPackage");
const WebMealPrice = require("../Schema/Web/MealPrice");
const WebGuestType = require("../Schema/Web/GuestType");
const MealType = require("../Schema/Web/MealTypes");
const File = require("../Schema/FileSchema");

const Get = async (req, res) => {
  const { type } = req.query;
  // const { price } = req.query;
  const { email } = req.query;
  const { roomtype } = req.query;
  const { city } = req.query;

  const { rateproperty, rateroom, rooms } = req.query;

  const { place, checkin, checkout } = req.query;

  try {
    if (!type) {
      return res
        .status(400)
        .json({ message: "Type is required in the request body" });
    }
    let data;
    let mergedData = [];
    if (type === "Propertymaster") {
      data = await Property.find();
      res.status(200).json(data);
    } else if (type === "Propertytype") {
      data = await Propertytype.find();
      res.status(200).json(data);
    } else if (type === "Roomtype") {
      data = await Roomtype.find();
      res.status(200).json(data);
    } else if (type === "Roomview") {
      data = await Roomview.find();
      res.status(200).json(data);
    } else if (type === "Bedtype") {
      data = await Bedview.find();
      res.status(200).json(data);
    } else if (type === "Measurement") {
      data = await Measurement.find();
      res.status(200).json(data);
    } else if (type === "Amenities") {
      data = await Amenities.find();
      res.status(200).json(data);
    } else if (type === "AmenitiesCategory") {
      data = await AmenitiesCategory.find();
      res.status(200).json(data);
    } else if (type === "Transport") {
      data = await Transport.find();
      res.status(200).json(data);
    } else if (type === "Usertype") {
      data = await User.find();
      res.status(200).json(data);
    } else if (type === "Userproperty") {
      data = await UserProperty.find();
      res.status(200).json(data);
    } else if (type === "Currency") {
      data = await Currency.find();
      res.status(200).json(data);
    } else if (type === "Filetype") {
      data = await File.find();
      res.status(200).json(data);
    } else if (type === "RateMaster") {
      data = await Rate.find();
      res.status(200).json(data);
    } else if (type === "InventoryMaster") {
      data = await Inventory.find();
      res.status(200).json(data);
    } else if (type === "PriceFilter") {
      data = await PriceFilter.find();
      res.status(200).json(data);
    } else if (type === "AmenitiesMaster") {
      data = await AmenitiesMaster.find();
      res.status(200).json(data);
    } else if (type === "Ratings") {
      data = await Ratings.find();
      res.status(200).json(data);
    } else if (type === "GuestEmail") {
      data = await GuestEmail.find();
      res.status(200).json(data);
    } else if (type === "Hotelsearch") {
      try {
        // Aggregate to find all properties in the given city
        console.log("<<<<<<ghfhh>>>>>", place);

        const place1 = await Property.aggregate([
          {
            $match: {
              City: { $regex: `^${place}$` },
              Status: 1,
            },
          },
          {
            $project: {
              Propertycode: 1,
              Propertytype: 1,
              Propertyname: 1,
              From: 1,
              Bestroute: 1,
              RatingId: 1,
              Area: 1,
              Rating: 1,
            },
          },
        ]);
        console.log(">>>>>>>rtr>>>>>>>>>", place1);
        if (place1.length === 0)
          return res.status(404).json({ error: "City not found" });

        // console.log("place", place1);

        // Extract property codes for searching inventory
        const propertyCodes = place1.map((p) => p.Propertycode);

        // Aggregate to find all check-in and check-out data
        const checkin1 = await Inventory.aggregate([
          {
            $match: {
              PropertyCode: { $in: propertyCodes },
              AvailableDate: { $gte: checkin, $lte: checkout },
              AvailableRooms: { $gt: 0 },
            },
          },
          {
            $group: {
              _id: "$PropertyCode", // Grouping only by PropertyCode
              AvailableRooms: { $first: "$AvailableRooms" },
            },
          },
          {
            $project: {
              _id: 0,
              PropertyCode: "$_id", // Projecting only the unique PropertyCode
              AvailableRooms: "$AvailableRooms",
            },
          },
        ]);
        // console.log("checkin", checkin1);
        console.log("checkin1", checkin1);

        const checkinCodes = checkin1.map((p) => p.PropertyCode);
        console.log("checkinCodes");
        console.log(checkinCodes);

        // Aggregate to find all room types for the properties
        const roomtypes = await Roomtype.aggregate([
          {
            $match: {
              // PropertyCode: { $in: checkoutCodes },
              PropertyCode: { $in: checkinCodes },
            },
          },
          {
            $project: {
              PropertyCode: 1,
              Displayname: 1,
              Bedview: 1,
              Roomcode: 1,
              Totalrooms: 1,
              Maxoccupancy: 1,
            },
          },
        ]);

        const Amenities = await AmenitiesMaster.aggregate([
          {
            $match: {
              PropertyCode: { $in: checkinCodes },
            },
          },
        ]);
        // console.log("Roomtypes", roomtypes);

        const roomPropertyCodes = roomtypes.map((p) => p.PropertyCode);
        const roomCodes = roomtypes.map((p) => p.Roomcode);
        console.log("roomPropertyCodes", roomPropertyCodes);
        console.log("roomCodes", roomCodes);

        // Aggregate to find all room prices
        const prices = await Rate.aggregate([
          {
            $match: {
              PropertyCode: { $in: checkinCodes },
              RoomCode: { $in: roomCodes },
              EntryDate: checkin,
            },
          },
          {
            $project: {
              PropertyCode: 1,
              RoomCode: 1,
              SingleTarrif: 1,
            },
          },
        ]);
        console.log("prices", prices);

        // Aggregate to find all images for the properties
        const images = await File.aggregate([
          {
            $match: {
              PropertyCode: { $in: propertyCodes },
            },
          },
          {
            $project: {
              PropertyCode: 1,
              PropertyImage: 1,
              CoverImage: 1,
              Others: 1,
            },
          },
        ]);

        // const priceFilters = await Rate.aggregate([
        //   {
        //     $match: {
        //       PropertyCode: { $in: roomPropertyCodes },
        //       RoomCode: { $in: roomCodes },
        //       EntryDate: checkin,

        //     },
        //   },
        //   {
        //     $project: {
        //       PropertyCode: 1,
        //       RoomCode: 1,
        //       SingleTarrif: 1,
        //     },
        //   },
        // ]);

        // Now merge the data
        mergedData = checkin1.map((property) => {
          const propertyCode = property.PropertyCode;
          console.log("propertyCode", propertyCode);

          return {
            categories: place1
              .filter((a) => a.Propertycode === propertyCode)
              .map((a) => ({
                PropertyId: a.Propertycode,
                Category: a.Propertytype,
                Name: a.Propertyname,
                Area: a.Area,
                RatingId: a.RatingId,
                From: a.From,
                Bestroute: a.Bestroute,
              })),

            Amenities: Amenities.filter(
              (c) => c.PropertyCode === propertyCode
            ).map((c) => ({
              Amenities: c,
            })),

            checkinRooms: checkin1
              .filter((c) => c.PropertyCode === propertyCode)
              .map((c) => ({
                AvailableRooms: c.AvailableRooms,
              })),

            roomtypes: roomtypes
              .filter((r) => r.PropertyCode === propertyCode)
              .map((r) => ({
                Roomtype: r.Displayname,
                Bedinfo: r.Bedview,
                Totalrooms: r.Totalrooms,
                Maxoccupancy: r.Maxoccupancy,
              })),

            prices: prices
              .filter((p) => p.PropertyCode === propertyCode)
              .map((p) => ({
                // RoomCode: p.RoomCode,
                Price: p.SingleTarrif,
              })),

            images: images
              .filter((img) => img.PropertyCode === propertyCode)
              .map((img) => {
                let imageData = {};

                if (img.CoverImage && img.CoverImage.length > 0) {
                  imageData.Coverimage = img.CoverImage; // Add only if not empty
                }

                if (img.Others && img.Others.length > 0) {
                  imageData.Smallimages = img.Others; // Add only if not empty
                }

                if (img.PropertyImage && img.PropertyImage.length > 0) {
                  imageData.PropertyImage = img.PropertyImage; // Add only if not empty
                }

                return imageData;
              })
              .filter((img) => Object.keys(img).length > 0), // Remove empty objects
          };
        });
        // console.log("mergedData>>>>>>>>>>>>>>>>>>>>||||||||||||||||||||||||||||||||||||||", mergedData);

        // console.log(mergedData);
        // Send response with merged data
        res.status(200).json(mergedData);
      } catch (error) {
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
    } else if (type === "PriceFilterSearch") {
      try {
        const {
          place,
          checkin,
          checkout,
          propertyType,
          roomAmenities,
          StarRating,
          Price,
        } = req.query;

        console.log("====================================");
        console.log("StarRating:", StarRating);
        console.log("Price:", Price);
        console.log("====================================");

        // Convert query parameters into arrays
        const propertyTypeFilter = propertyType ? propertyType.split(",") : [];
        const roomAmenitiesFilter = roomAmenities
          ? roomAmenities.split(",")
          : [];
        let ratingsArray = [];
        if (StarRating) {
          ratingsArray =
            typeof StarRating === "string"
              ? StarRating.includes(",")
                ? StarRating.split(",").map((r) =>
                    parseInt(r.replace("stars", ""))
                  )
                : [parseInt(StarRating.replace("stars", ""))]
              : [];
          if (ratingsArray.some((r) => isNaN(r))) {
            return res.status(400).json({
              error:
                "Invalid StarRating format. Use '1stars' or '1stars,2stars'",
            });
          }
        }

        // Parse price ranges
        let priceRanges = [];
        if (Price) {
          priceRanges = Price.split(",").map((range) => {
            const [min, max] = range.split("-").map(Number);
            if (isNaN(min) || isNaN(max)) {
              throw new Error("Invalid Price format. Use '0-2500,2500-5000'");
            }
            return { min, max };
          });
        }

        console.log("Filters:", {
          propertyType,
          roomAmenities,
          StarRating,
          ratingsArray,
          priceRanges,
        });

        // Step 1: Base filter with place
        let properties = await Property.aggregate([
          { $match: { City: place } },
          {
            $project: {
              Propertycode: 1,
              Propertytype: 1,
              Propertyname: 1,
              From: 1,
              Bestroute: 1,
              RatingId: 1,
              Area: 1,
              Rating: 1,
            },
          },
        ]);

        if (properties.length === 0) {
          return res
            .status(404)
            .json({ error: "No properties found for the given place" });
        }

        let propertyCodes = properties.map((p) => p.Propertycode);
        console.log("Initial propertyCodes:", propertyCodes);

        // Step 2: Filter by checkin and checkout availability
        const checkinAvailability = await Inventory.aggregate([
          {
            $match: {
              PropertyCode: { $in: propertyCodes },
              AvailableDate: checkin,
              AvailableRooms: { $gt: 0 },
            },
          },
        ]);
        propertyCodes = checkinAvailability.map((p) => p.PropertyCode);
        console.log("After checkin filter propertyCodes:", propertyCodes);

        const checkoutAvailability = await Inventory.aggregate([
          {
            $match: {
              PropertyCode: { $in: propertyCodes },
              AvailableDate: checkout,
              AvailableRooms: { $gt: 0 },
            },
          },
        ]);
        propertyCodes = checkoutAvailability.map((p) => p.PropertyCode);
        console.log("After checkout filter propertyCodes:", propertyCodes);

        if (propertyCodes.length === 0) {
          return res
            .status(404)
            .json({ error: "No properties available for the selected dates" });
        }

        properties = properties.filter((p) =>
          propertyCodes.includes(p.Propertycode)
        );
        console.log("Properties after availability filter:", properties);

        // Step 3: Apply propertyType filter if provided
        if (propertyTypeFilter.length > 0) {
          properties = properties.filter(
            (p) => p.Propertytype && propertyTypeFilter.includes(p.Propertytype)
          );
          propertyCodes = properties.map((p) => p.Propertycode);
          console.log(
            "After propertyType filter propertyCodes:",
            propertyCodes
          );
        }

        // Step 4: Apply room amenities filter if provided
        let amenitiesData = [];
        if (roomAmenitiesFilter.length > 0) {
          const normalizedRoomAmenities = roomAmenitiesFilter.map((amenity) =>
            amenity.replace(/\s+/g, "").toLowerCase()
          );

          amenitiesData = await AmenitiesMaster.aggregate([
            { $match: { PropertyCode: { $in: propertyCodes } } },
            {
              $addFields: {
                filteredAmenities: {
                  $filter: {
                    input: { $objectToArray: "$$ROOT" },
                    cond: {
                      $and: [
                        {
                          $in: [
                            {
                              $toLower: {
                                $replaceAll: {
                                  input: "$$this.k",
                                  find: " ",
                                  replacement: "",
                                },
                              },
                            },
                            normalizedRoomAmenities,
                          ],
                        },
                        { $eq: ["$$this.v", "yes"] },
                      ],
                    },
                  },
                },
              },
            },
            {
              $match: {
                $expr: {
                  $gte: [
                    { $size: "$filteredAmenities" },
                    normalizedRoomAmenities.length,
                  ],
                },
              },
            },
          ]);

          const amenitiesPropertyCodes = amenitiesData.map(
            (a) => a.PropertyCode
          );
          properties = properties.filter((p) =>
            amenitiesPropertyCodes.includes(p.Propertycode)
          );
          propertyCodes = properties.map((p) => p.Propertycode);
          console.log("After amenities filter propertyCodes:", propertyCodes);
        } else {
          amenitiesData = await AmenitiesMaster.find({
            PropertyCode: { $in: propertyCodes },
          });
        }

        // Step 5: Apply star rating filter if provided
        if (ratingsArray.length > 0) {
          console.log(
            "Applying rating filter with ratingsArray:",
            ratingsArray
          );
          console.log("PropertyCodes before rating filter:", propertyCodes);

          properties = await Property.aggregate([
            { $match: { Propertycode: { $in: propertyCodes } } },
            {
              $lookup: {
                from: "ratingsnumbers",
                localField: "RatingId",
                foreignField: "RatingId",
                as: "ratingData",
              },
            },
            {
              $unwind: {
                path: "$ratingData",
                preserveNullAndEmptyArrays: true,
              },
            },
            {
              $match: {
                "ratingData.Rating": { $in: ratingsArray },
              },
            },
            {
              $project: {
                Propertycode: 1,
                Propertytype: 1,
                Propertyname: 1,
                From: 1,
                Bestroute: 1,
                RatingId: 1,
                Area: 1,
                Rating: "$ratingData.Rating",
              },
            },
          ]);

          console.log("Properties after rating filter:", properties);
          propertyCodes = properties.map((p) => p.Propertycode);
          console.log("PropertyCodes after rating filter:", propertyCodes);
        }

        // Step 6: Fetch additional data and apply price filter
        const roomtypes = await Roomtype.aggregate([
          { $match: { PropertyCode: { $in: propertyCodes } } },
        ]);

        const roomCodes = roomtypes.map((r) => r.Roomcode);

        let priceFilters = await Rate.aggregate([
          {
            $match: {
              PropertyCode: { $in: propertyCodes },
              RoomCode: { $in: roomCodes },
              EntryDate: checkin,
            },
          },
        ]);

        // Step 6.1: Apply price range filter if provided
        if (priceRanges.length > 0) {
          console.log("Applying price filter with ranges:", priceRanges);
          priceFilters = priceFilters.filter((p) =>
            priceRanges.some(
              (range) =>
                p.SingleTarrif >= range.min && p.SingleTarrif <= range.max
            )
          );

          const priceFilteredPropertyCodes = [
            ...new Set(priceFilters.map((p) => p.PropertyCode)),
          ];
          properties = properties.filter((p) =>
            priceFilteredPropertyCodes.includes(p.Propertycode)
          );
          propertyCodes = properties.map((p) => p.Propertycode);
          console.log("After price filter propertyCodes:", propertyCodes);

          if (propertyCodes.length === 0) {
            return res.status(404).json({
              error: "No properties found within the specified price range",
            });
          }
        }

        const images = await File.aggregate([
          { $match: { PropertyCode: { $in: propertyCodes } } },
        ]);

        // Step 7: Merge data
        const mergedData = properties.map((property) => {
          const propertyCode = property.Propertycode;

          return {
            categories: [
              {
                Category: property.Propertytype,
                Name: property.Propertyname,
                PropertyCode: propertyCode,
                From: property.From,
                Bestroute: property.Bestroute,
                RatingId: property.RatingId,
                Area: property.Area,
              },
            ],
            checkinRooms: checkinAvailability
              .filter((c) => c.PropertyCode === propertyCode)
              .map((c) => ({ AvailableRooms: c.AvailableRooms })),
            roomtypes: roomtypes
              .filter((r) => r.PropertyCode === propertyCode)
              .map((r) => ({
                Roomtype: r.Displayname,
                Bedinfo: r.Bedview,
                Totalrooms: r.Totalrooms,
                Maxoccupancy: r.Maxoccupancy,
              })),
            prices: priceFilters
              .filter((p) => p.PropertyCode === propertyCode)
              .map((p) => ({ Price: p.SingleTarrif })),
            Amenities: amenitiesData
              .filter((a) => a.PropertyCode === propertyCode)
              .map((a) => ({
                Amenities: a,
              })),
            images: images
              .filter((img) => img.PropertyCode === propertyCode)
              .map((img) => {
                let imageData = {};
                if (img.CoverImage?.length)
                  imageData.Coverimage = img.CoverImage;
                if (img.Others?.length) imageData.Smallimages = img.Others;
                if (img.PropertyImage?.length)
                  imageData.PropertyImage = img.PropertyImage;
                return imageData;
              })
              .filter((img) => Object.keys(img).length > 0),
          };
        });

        res.status(200).json(mergedData);
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .json({ error: "Internal server error", details: error.message });
      }
    } else if (type === "totalroomspost") {
      const rates = await Roomtype.aggregate([
        {
          $match: {
            PropertyCode: rateproperty,
          },
        },
        {
          $group: {
            _id: null,
            Totalrooms: { $sum: "$Totalrooms" },
          },
        },
      ]);
      const finalSum = rates[0].Totalrooms + Number(rooms);
      res.status(200).json(finalSum);
    } else if (type === "totalroomsupdate") {
      const rates = await Roomtype.aggregate([
        {
          $match: {
            PropertyCode: rateproperty,
            Roomcode: { $ne: rateroom },
          },
        },
        {
          $group: {
            _id: null,
            Totalrooms: { $sum: "$Totalrooms" },
          },
        },
      ]);
      const finalSum = rates[0].Totalrooms + Number(rooms);
      res.status(200).json(finalSum);
    } else if (type === "RateMasterRates") {
      console.log("req.body");
      console.log(req.body);

      const { propertycode, date } = req.query;
      const moment = require("moment"); // Ensure moment.js is installed (npm install moment)

      // Convert start date to "YYYY-MM-DD" format
      const startDate = moment(date, "YYYY-MM-DD").format("YYYY-MM-DD");

      // Generate 7-day range in "YYYY-MM-DD"
      const allDates = Array.from({ length: 7 }, (_, i) =>
        moment(startDate, "YYYY-MM-DD").add(i, "days").format("YYYY-MM-DD")
      );

      try {
        const rates = await Rate.aggregate([
          {
            $match: {
              PropertyCode: propertycode,
              EntryDate: { $in: allDates }, // Query all required dates
            },
          },
          {
            $project: {
              _id: 0,
              EntryDate: 1,
              DoubleTarrif: 1,
              SingleTarrif: 1,
              ExtraBedCharges: 1,
              RoomCode: 1,
              RatePlan: 1,
            },
          },
        ]);

        // Ensure all 7 dates are present, grouped by RoomCode
        const groupedRates = {};

        allDates.forEach((date) => {
          const ratesForDate = rates.filter((r) => r.EntryDate === date);

          // If rates exist for this date, group them by RoomCode
          ratesForDate.forEach((rate) => {
            if (!groupedRates[rate.RoomCode]) {
              groupedRates[rate.RoomCode] = [];
            }
            groupedRates[rate.RoomCode].push(rate);
          });

          // If no rates exist for this date, add a default entry
          if (ratesForDate.length === 0) {
            groupedRates["NoRoom"] = groupedRates["NoRoom"] || [];
            groupedRates["NoRoom"].push({
              EntryDate: date,
              DoubleTarrif: 0,
              SingleTarrif: 0,
              ExtraBedCharges: 0,
              RoomCode: null,
            });
          }
        });

        // Convert grouped data into an array
        const finalRates = Object.values(groupedRates).flat();

        res.status(200).json(finalRates);
      } catch (error) {
        console.error("Error fetching RateMasterRates:", error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    } else if (type === "PolicyType") {
      data = await PolicyType.find();
      res.status(200).json(data);
    } else if (type === "Policies") {
      data = await PolicyMaster.find();
      res.status(200).json(data);
    } else if (type === "RatingsNumber") {
      data = await RatingsNumber.find();
      res.status(200).json(data);
    } else if (type === "Ratings&Reviews") {
      data = await Ratings.find();
      res.status(200).json(data);
    } else if (type === "RatePlan") {
      data = await RatePlan.find();
      res.status(200).json(data);
    } else if (type === "RoomRateLink") {
      data = await RoomRateLink.find();
      res.status(200).json(data);
    } else if (type === "getemail") {
      // data = await UserProperty.find();
      const mail = await UserProperty.aggregate([
        {
          $match: {
            PropertyName: { $in: [email] },
          },
        },
        {
          $project: {
            Email: 1,
          },
        },
      ]);
      console.log("mail", mail);
      res.status(200).json(mail);
    } else if (type === "Ratevalidation") {
      const ratevalidation = await Roomtype.aggregate([
        {
          $match: {
            Roomcode: roomtype,
          },
        },
        {
          $project: {
            Totalrooms: 1,
          },
        },
      ]);
      console.log("mail", ratevalidation);
      res.status(200).json(ratevalidation);
    } else if (type === "GuestDetail") {
      data = await GuestDetail.find();
      res.status(200).json(data);
    } else if (type === "IDProof") {
      data = await IDProof.find();
      res.status(200).json(data);
    } else if (type === "TemplateType") {
      data = await Templatetype.find();
      res.status(200).json(data);
    } else if (type === "BookingDetails") {
      data = await BookingSchema.find();
      res.status(200).json(data);
    } else if (type === "Email") {
      data = await Email.find();
      res.status(200).json(data);
    } else if (type === "EmailMaster") {
      data = await EmailMaster.find();
      res.status(200).json(data);
    } else if (type === "BookingDet") {
      data = await BookingDet.find();
      res.status(200).json(data);
    } else if (type === "BookingMas") {
      data = await BookingMas.find();
      res.status(200).json(data);
    } else if (type === "BookingDetDatewise") {
      data = await BookingDetDatewise.find();
      res.status(200).json(data);
    } else if (type === "BookingPerDayRent") {
      data = await BookingPerDayRent.find();
      res.status(200).json(data);
    } else if (type === "ConferenceRoom") {
      data = await Conference.find();
      res.status(200).json(data);
    } else if (type === "Purpose") {
      data = await Purpose.find();
      res.status(200).json(data);
    } else if (type === "PropertyOwnertype") {
      data = await PropertyOwner.find();
      res.status(200).json(data);
    } else if (type === "UtilityType") {
      data = await Utility.find();
      res.status(200).json(data);
    } else if (type === "Ota") {
      data = await Ota.find();
      res.status(200).json(data);
    } else if (type === "ManagementType") {
      data = await Managementtype.find();
      res.status(200).json(data);
    } else if (type === "BlockHall") {
      data = await BlockHall.find();
      res.status(200).json(data);
    } else if (type === "BlockHallDet") {
      data = await BlockHallDet.find();
      res.status(200).json(data);
    } else if (type === "Area") {
      try {
        const Area = await Property.find({ City: city });
        if (!Area.length) {
          return res
            .status(404)
            .json({ message: "No areas found for this city" });
        }
        const Arealist = Area.map((item) => item.Area);
        console.log("Area", Arealist);
        res.status(200).json({ Area: Arealist });
      } catch (error) {
        console.error("Error fetching areas:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
    /////////////  Web  ////////////
    else if (type === "WebCancellation") {
      data = await WebCancellation.find();
      res.status(200).json(data);
    } else if (type === "getWeb") {
      data = await Web.find();
      res.status(200).json(data);
    }
    ///// Need to Create in Table /////
    else if (type === "WebRoomType") {
      data = await WebRoom.find();
      res.status(200).json(data);
    } else if (type === "WebRoomOccupancy") {
      data = await WebRoomOccupancy.find();
      res.status(200).json(data);
    } else if (type === "WebRoomAmenities") {
      data = await WebRoomAmenities.find();
      res.status(200).json(data);
    } else if (type === "WebMealPackage") {
      data = await WebMealPackage.find();
      res.status(200).json(data);
    } else if (type === "WebMealPrice") {
      data = await WebMealPrice.find();
      res.status(200).json(data);
    } else if (type === "WebGuestType") {
      data = await WebGuestType.find();
      res.status(200).json(data);
    } 
    // else if (type === "WebMealType") {
    //   data = await WebMealType.find();
    //   res.status(200).json(data);
    // } 
    else if (type === "ImageCategory") {
      data = await ImageCategory.find();
      res.status(200).json(data);
    }

    //      else if (type === "PropertyRates") {
    //       const { propertycode } = req.query;
    //       try {
    //         const rates = await Property.aggregate([
    //           {
    //             $match: {
    //               Propertycode: propertycode,
    //             },
    //           },
    //           {
    //             $project: {
    //               _id: 0,
    //               Noofrooms: 1,
    //             },
    //           },
    //         ]);
    // console.log("rates",rates);

    //         res.status(200).json(rates);
    //       } catch (error) {
    //         console.error("Error fetching RateMasterRates:", error);
    //         res.status(500).json({ message: "Server error", error: error.message });
    //       }
    //     }
    else {
      return res.status(400).json({ message: "Invalid type provided" });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


const GetHotelList = async (req, res) => {
  try {
    const {
      propertyType,
      roomAmenities,
      StarRating,
      Price
    } = req.query;

    // Convert query params into arrays
    const propertyTypeFilter = propertyType ? propertyType.split(",") : [];
    const roomAmenitiesFilter = roomAmenities ? roomAmenities.split(",") : [];

    let ratingsArray = [];
    if (StarRating) {
      ratingsArray = typeof StarRating === "string"
        ? StarRating.includes(",")
          ? StarRating.split(",").map(r => parseInt(r.replace("stars", "")))
          : [parseInt(StarRating.replace("stars", ""))]
        : [];

      if (ratingsArray.some(r => isNaN(r))) {
        return res.status(400).json({
          error: "Invalid StarRating format. Use '1stars' or '1stars,2stars'"
        });
      }
    }

    // Parse price ranges
    let priceRanges = [];
    if (Price) {
      priceRanges = Price.split(",").map(range => {
        const [min, max] = range.split("-").map(Number);
        if (isNaN(min) || isNaN(max)) {
          throw new Error("Invalid Price format. Use '0-2500,2500-5000'");
        }
        return { min, max };
      });
    }

    // STEP 1: Fetch all properties
    let properties = await Property.aggregate([
      {
        $project: {
          Propertycode: 1,
          Propertytype: 1,
          Propertyname: 1,
          From: 1,
          Bestroute: 1,
          RatingId: 1,
          Area: 1,
          Rating: 1
        }
      }
    ]);

    if (!properties.length) {
      return res.status(404).json({ error: "No properties found" });
    }

    let propertyCodes = properties.map(p => p.Propertycode);

    // STEP 2: Apply PropertyType filter
    if (propertyTypeFilter.length > 0) {
      properties = properties.filter(p => propertyTypeFilter.includes(p.Propertytype));
      propertyCodes = properties.map(p => p.Propertycode);
    }

    // STEP 3: Amenities filter
    let amenitiesData = [];
    if (roomAmenitiesFilter.length > 0) {
      const normalizedAmenities = roomAmenitiesFilter.map(a => a.replace(/\s+/g, "").toLowerCase());

      amenitiesData = await AmenitiesMaster.aggregate([
        { $match: { PropertyCode: { $in: propertyCodes } } },
        {
          $addFields: {
            filteredAmenities: {
              $filter: {
                input: { $objectToArray: "$$ROOT" },
                cond: {
                  $and: [
                    {
                      $in: [
                        {
                          $toLower: {
                            $replaceAll: {
                              input: "$$this.k",
                              find: " ",
                              replacement: "",
                            }
                          }
                        },
                        normalizedAmenities
                      ]
                    },
                    { $eq: ["$$this.v", "yes"] }
                  ]
                }
              }
            }
          }
        },
        {
          $match: {
            $expr: {
              $gte: [
                { $size: "$filteredAmenities" },
                normalizedAmenities.length
              ]
            }
          }
        }
      ]);

      const amenitiesPropertyCodes = amenitiesData.map(a => a.PropertyCode);
      properties = properties.filter(p => amenitiesPropertyCodes.includes(p.Propertycode));
      propertyCodes = properties.map(p => p.Propertycode);
    } else {
      amenitiesData = await AmenitiesMaster.find({ PropertyCode: { $in: propertyCodes } });
    }

    // STEP 4: StarRating Filter
    if (ratingsArray.length > 0) {
      properties = await Property.aggregate([
        { $match: { Propertycode: { $in: propertyCodes } } },
        {
          $lookup: {
            from: "ratingsnumbers",
            localField: "RatingId",
            foreignField: "RatingId",
            as: "ratingData"
          }
        },
        { $unwind: { path: "$ratingData", preserveNullAndEmptyArrays: true } },
        { $match: { "ratingData.Rating": { $in: ratingsArray } } },
        {
          $project: {
            Propertycode: 1,
            Propertytype: 1,
            Propertyname: 1,
            From: 1,
            Bestroute: 1,
            RatingId: 1,
            Area: 1,
            Rating: "$ratingData.Rating"
          }
        }
      ]);

      propertyCodes = properties.map(p => p.Propertycode);
    }

    // STEP 5: Fetch RoomTypes & Rates
    const roomtypes = await Roomtype.aggregate([
      { $match: { PropertyCode: { $in: propertyCodes } } }
    ]);
    const roomCodes = roomtypes.map(r => r.Roomcode);

    let rates = await Rate.aggregate([
      { $match: { PropertyCode: { $in: propertyCodes }, RoomCode: { $in: roomCodes } } }
    ]);

    // STEP 5.1: Price filter
    if (priceRanges.length > 0) {
      rates = rates.filter(p =>
        priceRanges.some(range => p.SingleTarrif >= range.min && p.SingleTarrif <= range.max)
      );

      const priceFilteredPropertyCodes = [...new Set(rates.map(p => p.PropertyCode))];
      properties = properties.filter(p => priceFilteredPropertyCodes.includes(p.Propertycode));
      propertyCodes = properties.map(p => p.Propertycode);

      if (!propertyCodes.length) {
        return res.status(404).json({ error: "No properties found in price range" });
      }
    }

    // STEP 6: Images
    const images = await File.aggregate([
      { $match: { PropertyCode: { $in: propertyCodes } } }
    ]);

    // STEP 7: Merge final data
    const mergedData = properties.map(property => {
      const propertyCode = property.Propertycode;

      return {
        categories: [{
          Category: property.Propertytype,
          Name: property.Propertyname,
          PropertyCode: propertyCode,
          From: property.From,
          Bestroute: property.Bestroute,
          RatingId: property.RatingId,
          Area: property.Area,
        }],
        roomtypes: roomtypes.filter(r => r.PropertyCode === propertyCode).map(r => ({
          Roomtype: r.Displayname,
          Bedinfo: r.Bedview,
          Totalrooms: r.Totalrooms,
          Maxoccupancy: r.Maxoccupancy
        })),
        prices: rates.filter(p => p.PropertyCode === propertyCode).map(p => ({
          Price: p.SingleTarrif
        })),
        Amenities: amenitiesData.filter(a => a.PropertyCode === propertyCode).map(a => ({
          Amenities: a
        })),
        images: images.filter(img => img.PropertyCode === propertyCode).map(img => {
          let imageData = {};
          if (img.CoverImage?.length) imageData.Coverimage = img.CoverImage;
          if (img.Others?.length) imageData.Smallimages = img.Others;
          if (img.PropertyImage?.length) imageData.PropertyImage = img.PropertyImage;
          return imageData;
        }).filter(img => Object.keys(img).length > 0)
      };
    });

    res.status(200).json(mergedData);
  } catch (error) {
    console.error("Error in GetHotelLists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// const GetWebMealType = async (req, res) => {
//   try {
//     const data = await WebMealType.find();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

//GetMealType
const GetMealType = async (req, res) => {
  try {
    const { PropertyCode } = req.query;

    if (!PropertyCode) {
      return res.status(400).json({ message: "PropertyCode is required" });
    }

    const data = await MealType.find({ PropertyCode });

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



//Hotel Details page:3
const GetHotelDetails = async (req, res) => {
  try {
    const PropertyCode = req.query.PropertyCode;
    console.log("GetHotelDetails - PropertyCode:", PropertyCode);

    // ✅ 1. Check if PropertyCode is provided
    if (!PropertyCode) {
      return res.status(400).json({ message: "PropertyCode is required" });
    }

    // ✅ 2. Query all collections with correct field name: "PropertyCode"
    const [coverimage, abouthotel, amenitiesmaster, roomtypes, rates] =
      await Promise.all([
        File.find({ PropertyCode }),
        Property.find({ PropertyCode }), // ✅ FIXED HERE
        AmenitiesMaster.find({ PropertyCode }),
        Roomtype.find({ PropertyCode }),
        Rate.find({ PropertyCode, EntryDate: { $ne: "" } }),
      ]);

    // ✅ 3. Log actual data found
    console.log("Hotel Data: ", abouthotel);
    if (abouthotel.length === 0) {
      return res
        .status(404)
        .json({ message: "No hotel found for this PropertyCode" });
    }

    const hotel = abouthotel[0];
    const imageInfo = coverimage[0]?.CoverImage || [];
    const amenitiesInfo = amenitiesmaster[0] || {};

    // ✅ 4. Extract amenities marked "yes"
    const amenityKeys = [
      "Barbeque",
      "Breakfast",
      "Cafe",
      "Housekeeping",
      "LAN",
      "Washing Machine",
      "EV Charging Station",
      "Bonfire Pit",
      "Prayer Room",
      "Seating Area",
      "Terrace",
    ];

    const amenitiesList = amenityKeys.filter(
      (key) => amenitiesInfo[key] === "yes"
    );

    // ✅ 5. Prepare and send response
    const response = {
      Propertyname: hotel.Propertyname || "",
      Propertydescription: hotel.Propertydescription || "",
      Propertyaddress: hotel.Propertyaddress || "",
      coverimage: imageInfo[0] || "",
      Roomtypes: roomtypes,
      rates: rates,
      Amenities: amenitiesList,
    };

    return res.json(response);
  } catch (error) {
    console.error("GetHotelDetails Error:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
// 3rd page
const PropertyDetails = async (req, res) => {
  const PropertyCode = req.query.PropertyCode;
  const property = await Property.find({ PropertyCode: PropertyCode });
  console.log("Propertydata");
  console.log(property);
  res.send(property);
};

// const PropertyImages = async (req, res) => {
//   const PropertyCode = req.query.PropertyCode;
//   const images = await File.find({
//     PropertyCode: PropertyCode,
//     PropertyImage: { $exists: true, $not: { $size: 0 } },
//   });
//   res.send(images);
// };
// 3rd page
const PropertyImages = async (req, res) => {
  try {
    // const PropertyCode = req.query.PropertyCode;

    // if (!PropertyCode) {
    //   return res.status(400).json({ error: "PropertyCode is required" });
    // }

    const images = await File.find({
      // PropertyCode,
      $or: [
        {
          PropertyImage: {
            $exists: true,
            $ne: null,
            $not: { $size: 0 },
          },
        },
        {
          // For cases where PropertyImage is stored as a single string (not array)
          PropertyImage: { $type: "string", $ne: "" },
        },
      ],
    });

    if (!images.length) {
      return res
        .status(404)
        .json({ message: "No images found for this property" });
    }

    res.json(images);
  } catch (error) {
    console.error("Error fetching property images:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
// 3rd page
const PropertyPolicies = async (req, res) => {
  const PropertyCode = req.query.PropertyCode;
  console.log(`PropertyCode:${PropertyCode}`);
  const Policies = await PolicyMaster.find({ PropertyCode: PropertyCode });
  console.log(Policies);
  res.send(Policies);
};
// 3rd page
const PropertyRates = async (req, res) => {
  const PropertyCode = req.query.PropertyCode?.trim();
  console.log("Searching for PropertyCode:", PropertyCode);
  const rates = await Rate.find({ PropertyCode: PropertyCode });
  res.send(rates);
};
// 3rd page
const PropertyAmenities = async (req, res) => {
  const PropertyCode = req.query.PropertyCode;
  console.log(`PropertyCode:${PropertyCode}`);
  const amenities = await AmenitiesMaster.find({ PropertyCode: PropertyCode });
  console.log(amenities);
  res.send(amenities);
};
// 3rd page
const PropertyRatingsAndReveiws = async (req, res) => {
  const PropertyCode = req.query.PropertyCode;
  console.log(`PropertyCode:${PropertyCode}`);
  const ratings = await Ratings.find({ PropertyCode: PropertyCode });
  console.log(ratings);
  res.send(ratings);
};
// 4th page
const GetPaymentPageDetails = async (req, res) => {
  console.log("GetPaymentPageDetails");
  const PropertyCode = req.query.PropertyCode;
  const EntryDate = req.query.EntryDate;
  try {
    // Use lean() for faster query response (returns plain JS objects)
    const coverimage = await File.findOne({
      PropertyCode,
      CoverImage: { $exists: true, $ne: [] }, // Ensure CoverImage exists and is not empty
    })
      .select("CoverImage")
      .lean();

    const propertyimage = await File.find(
      { PropertyCode },
      { PropertyImage: 1 }
    ).lean();
    const abouthotel = await Property.findOne({
      Propertycode: PropertyCode,
    }).lean();
    const amenitiesmaster = await AmenitiesMaster.findOne({
      PropertyCode,
    }).lean();
    const roomtypes = await Roomtype.find({ PropertyCode }).lean();
    const rates = await Rate.find({
      PropertyCode,
      EntryDate: { $eq: EntryDate },
    }).lean();
    const ratings = await Ratings.findOne({ PropertyCode }).lean();

    // Set fallback values using optional chaining and nullish coalescing
    let coverimagename = coverimage?.CoverImage?.[0] || "";
    let propertyname = abouthotel?.Propertyname || "";
    let propertycode = abouthotel?.Propertycode || "";
    let propertydescription = abouthotel?.Propertydescription || "";
    let propertyaddress = abouthotel?.Propertyaddress || "";
    let ratingAndReviews = ratings || {};
    let checkin = abouthotel?.Checkin || "";
    let checkout = abouthotel?.Checkout || "";

    // Extract amenities dynamically where value is 'yes'
    let amenitieslist = [];
    if (amenitiesmaster) {
      amenitieslist = Object.keys(amenitiesmaster).filter(
        (key) => amenitiesmaster[key] === "yes"
      );
    }

    const jsondata = {
      Propertyname: propertyname,
      Propertydescription: propertydescription,
      PropertyCode: propertycode,
      Propertyaddress: propertyaddress,
      coverimage: coverimagename,
      Roomtypes: roomtypes,
      rates: rates,
      Amenities: amenitieslist,
      Ratingandreviews: ratingAndReviews,
      Checkin: checkin,
      Checkout: checkout,
    };

    res.status(200).json(jsondata);
  } catch (error) {
    console.error("Error fetching payment page details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// const GetRoomType = async (req, res) => {
//   const PropertyCodeData = req.query.PropertyCode;
//   const EntryDate = req.query.EntryDate;
//   console.log(`PropertyCodeData:${PropertyCodeData}`);
//   const RoomTypeInfo = await Roomtype.find({ PropertyCode: PropertyCodeData });
//   const RoomCodeArray = RoomTypeInfo.map((item) => item.Roomcode);
//   console.log("RoomCodeArray", RoomCodeArray);

//   const RateMasterInfo = await Rate.find({
//     RoomCode: { $in: RoomCodeArray },
//     EntryDate,
//   });
//   const RoomImages = await File.find({ RoomCode: { $in: RoomCodeArray } });

//   console.log("RoomImages", RoomImages);
//   console.log("RateMasterInfo", RateMasterInfo);

//   const mergedData = RoomTypeInfo.map((roomType) => {
//     // Filter and collect all matching rate plans based on RoomCode
//     const ratePlans =
//       RateMasterInfo.filter((rate) => rate.RoomCode === roomType.Roomcode) ||
//       [];

//     // Filter and collect all matching room images based on RoomCode
//     const roomImages =
//       RoomImages.filter((image) => image.RoomCode === roomType.Roomcode) || [];

//     return {
//       RoomType: roomType,
//       Rateplan: ratePlans, // Collect multiple rate plans into an array
//       RoomImages: roomImages, // Collect multiple room images into an array
//     };
//   });

//   res.send(mergedData);
//   console.log("mergedData", mergedData);

//   // res.send(mergeddata);

//   // const mergeddata = {"RoomType":RoomTypeInfo,"Rateplan":RateMasterInfo, "RoomImages": RoomImages}
//   // res.send(mergeddata)
//   // console.log("mergeddata",mergeddata);
// };
//3rd page
const GetRoomType = async (req, res) => {
  try {
    const PropertyCodeData = req.query.PropertyCode;
    const EntryDate = req.query.EntryDate;

    console.log("PropertyCodeData:", PropertyCodeData);
    console.log("EntryDate:", EntryDate);

    const RoomTypeInfo = await Roomtype.find({
      PropertyCode: PropertyCodeData,
    });
    if (!RoomTypeInfo.length) {
      return res.status(404).json({ message: "No room types found" });
    }

    const RoomCodeArray = RoomTypeInfo.map((item) => item.Roomcode).filter(
      Boolean
    );
    console.log("RoomCodeArray", RoomCodeArray);

    const RateMasterInfo = await Rate.find({
      RoomCode: { $in: RoomCodeArray },
      EntryDate: EntryDate, // or new Date(EntryDate) if needed
    });

    const RoomImages = await File.find({
      RoomCode: { $in: RoomCodeArray },
    });

    const mergedData = RoomTypeInfo.map((roomType) => {
      const ratePlans = RateMasterInfo.filter(
        (rate) => rate.RoomCode === roomType.Roomcode
      );
      const roomImages = RoomImages.filter(
        (img) => img.RoomCode === roomType.Roomcode
      );

      return {
        RoomType: roomType,
        Rateplan: ratePlans,
        RoomImages: roomImages,
      };
    });

    console.log("mergedData:", mergedData);
    res.json(mergedData);
  } catch (err) {
    console.error("Error in GetRoomType:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  Get,
  GetHotelDetails,
  GetPaymentPageDetails,
  PropertyDetails,
  PropertyPolicies,
  PropertyImages,
  PropertyRates,
  PropertyAmenities,
  PropertyRatingsAndReveiws,
  GetRoomType,
  GetMealType,
  GetHotelList
};
