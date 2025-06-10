const express = require("express");
const router = express.Router();
const path = require("path");
const moment = require("moment");
const mongoose = require("mongoose");
const Property = require("../Schema/Property/PropertySchema");
const Roomtype = require("../Schema/Property/RoomtypeSchema");
const Conference = require("../Schema/Property/ConferenceRoom");
const BlockHall = require("../Schema/Property/Block_Hall/BlockHallSchema");
const BlockHallDet = require("../Schema/Property/Block_Hall/BlockHallDet");

router.get('/conferencelist', async (req, res) => {
    try {
        // Extract query parameters
        const { location, date } = req.query;

        // Validate required parameters
        if (!location || !date) {
            return res.status(400).json({
                success: false,
                message: "Location and date are required parameters"
            });
        }

        // Validate date format
        if (!moment(date, "YYYY-MM-DD", true).isValid()) {
            return res.status(400).json({
                success: false,
                message: "Invalid date format. Please use YYYY-MM-DD"
            });
        }

        // Find properties in the specified city
        const properties = await Property.find({
            City: { $regex: new RegExp(location, 'i') }
        }).select('PropertyCode');
        console.log("Properties found:", properties);

        if (!properties.length) {
            return res.status(404).json({
                success: false,
                message: "No properties found in the specified location"
            });
        }

        // Extract property codes
        const propertyCodes = properties.map(prop => prop.PropertyCode);
        console.log("Property codes:", propertyCodes);

        // Find room types with isConference = 1 for these properties
        const roomTypes = await Roomtype.find({
            PropertyCode: { $in: propertyCodes },
            isConference: 1
        }).select('PropertyCode RoomTypeCode');
        console.log("Room types with isConference = 1:", roomTypes);

        if (!roomTypes.length) {
            return res.status(404).json({
                success: false,
                message: "No conference rooms found for the specified location"
            });
        }

        // Extract property codes from room types
        const conferencePropertyCodes = roomTypes.map(rt => rt.PropertyCode);
        console.log("Conference property codes:", conferencePropertyCodes);

        // Find conference room details
        const conferenceRooms = await Conference.find({
            PropertyCode: { $in: conferencePropertyCodes }
        });
        console.log("Conference rooms found:", conferenceRooms);

        if (!conferenceRooms.length) {
            return res.status(404).json({
                success: false,
                message: "No conference room details found for the specified properties",
                debug: {
                    conferencePropertyCodes,
                    note: "Check if Conference collection has documents with these PropertyCodes"
                }
            });
        }

        // Find blocked slots from BlockHall and BlockHallDet
        const blockHalls = await BlockHall.find({
            PropertyCode: { $in: conferencePropertyCodes },
            Blockdate: date
        }).select('Blkid PropertyCode');
        console.log("BlockHall entries found:", blockHalls);

        const blkIds = blockHalls.map(bh => bh.Blkid);
        const blockHallDetails = await BlockHallDet.find({
            Blkid: { $in: blkIds },
            Stopsales: 1
        }).select('Slotname');
        console.log("Blocked slots found:", blockHallDetails);

        // Extract blocked slot names
        const blockedSlotNames = blockHallDetails.map(bhd => bhd.Slotname);

        // Fetch property details manually from Property
        const propertyDetails = await Property.find({
            PropertyCode: { $in: conferencePropertyCodes }
        }).select('PropertyCode PropertyName City Address');
        console.log("Property details:", propertyDetails);

        // Format response, excluding blocked slots
        const formattedResponse = conferenceRooms.map(room => {
            const property = propertyDetails.find(p => p.PropertyCode === room.PropertyCode) || {};
            // Filter out blocked slots
            const availableSlots = room.Slots.filter(slot => !blockedSlotNames.includes(slot.slotName));
            return {
                propertyCode: room.PropertyCode,
                propertyName: property.PropertyName || 'N/A',
                city: property.City || 'N/A',
                address: property.Address || 'N/A',
                conferenceRoomDetails: {
                    hallName: room.HallName,
                    roomType: room.RoomType,
                    capacity: room.Capacity,
                    amenities: room.Amenities,
                    conferenceImages: room.ConferenceImages,
                    slots: availableSlots.map(slot => ({
                        slotName: slot.slotName,
                        from: slot.from,
                        to: slot.to,
                        price: slot.price,
                        availability: slot.availability
                    }))
                }
            };
        });

        res.status(200).json({
            success: true,
            data: formattedResponse,
            message: "Conference rooms fetched successfully"
        });

    } catch (error) {
        console.error("Error fetching conference rooms:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
            error: error.message
        });
    }
});

module.exports = router;