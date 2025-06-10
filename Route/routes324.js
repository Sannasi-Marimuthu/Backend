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
        }).select('Propertycode');
        console.log("Properties found:", properties);

        if (!properties.length) {
            return res.status(404).json({
                success: false,
                message: "No properties found in the specified location"
            });
        }

        // Extract property codes
        const propertyCodes = properties.map(prop => prop.Propertycode);
        console.log("Property codes:", propertyCodes);

        // Find room types with isConference = 1 for these properties
        const roomTypes = await Roomtype.find({
            PropertyCode: { $in: propertyCodes },
            isConference: 1
        }).select('PropertyCode Roomcode');
        console.log("Room types with isConference = 1:", roomTypes);

        if (!roomTypes.length) {
            return res.status(404).json({
                success: false,
                message: "No conference rooms found for the specified location"
            });
        }

        // Extract property codes and room codes from room types
        const conferencePropertyCodes = roomTypes.map(rt => rt.PropertyCode);
        const conferenceRoomCodes = roomTypes.map(rt => rt.Roomcode);
        console.log("Conference property codes:", conferencePropertyCodes);
        console.log("Conference Room codes:", conferenceRoomCodes);

        // Find conference room details
        const conferenceRooms = await Conference.find({
            PropertyCode: { $in: conferencePropertyCodes },
            RoomType: { $in: conferenceRoomCodes }
        });
        console.log("Conference rooms found:", conferenceRooms);

        if (!conferenceRooms.length) {
            return res.status(404).json({
                success: false,
                message: "No conference room details found for the specified properties",
                debug: {
                    conferencePropertyCodes,
                    conferenceRoomCodes,
                    note: "Check if Conference collection has documents with these PropertyCodes and RoomTypes"
                }
            });
        }

        // Find blocked slots from BlockHall and BlockHallDet
        const blockHalls = await BlockHall.find({
            PropertyCode: { $in: conferencePropertyCodes },
            RoomCode: { $in: conferenceRoomCodes },
            Blockdate: date
        }).select('Blkid PropertyCode RoomCode');
        console.log("BlockHall entries found:", blockHalls);

        // Map Blkid to RoomCode for accurate slot blocking
        const blkIdToRoomCode = blockHalls.reduce((map, bh) => {
            map[bh.Blkid] = bh.RoomCode;
            return map;
        }, {});
        console.log("Blkid to RoomCode mapping:", blkIdToRoomCode);

        const blkIds = blockHalls.map(bh => bh.Blkid);
        const blockHallDetails = await BlockHallDet.find({
            Blkid: { $in: blkIds },
            Stopsales: 1
        }).select('Blkid Slotname');
        console.log("Blocked slots found:", blockHallDetails);

        // Create a map of RoomCode to blocked Slotnames
        const blockedSlotsByRoomCode = blockHallDetails.reduce((map, bhd) => {
            const roomCode = blkIdToRoomCode[bhd.Blkid];
            if (roomCode) {
                if (!map[roomCode]) {
                    map[roomCode] = [];
                }
                map[roomCode].push(bhd.Slotname);
            }
            return map;
        }, {});
        console.log("Blocked slots by RoomCode:", blockedSlotsByRoomCode);

        // Fetch property details manually from Property
        const propertyDetails = await Property.find({
            Propertycode: { $in: conferencePropertyCodes }
        }).select('Propertycode Propertyname City Propertyaddress');
        console.log("Property details:", propertyDetails);

        // Format response to match desired frontend format
        const formattedResponse = conferenceRooms.map((room, index) => {
            const property = propertyDetails.find(p => p.Propertycode === room.PropertyCode) || {};
            // Get blocked slots for this room's RoomType (matches RoomCode)
            const blockedSlots = blockedSlotsByRoomCode[room.RoomType] || [];
            // Filter out blocked slots
            const availableSlots = room.Slots.filter(slot => !blockedSlots.includes(slot.slotName));

            // Calculate average price from slots (or use first slot's price if available)
            const totalPrice = availableSlots.reduce((sum, slot) => sum + (slot.price || 0), 0);
            const avgPrice = availableSlots.length > 0 ? Math.round(totalPrice / availableSlots.length) : 15000; // Default from sample

            // Count available slots for availability
            const slotAvailability = availableSlots.length;

            // Format hallDetails as a string
            const hallDetails = [
                `Capacity: ${room.Capacity || 'N/A'}`,
                ...(room.Amenities || []).map(a => a),
                room.HallName ? `Hall: ${room.HallName}` : null,
                // room.RoomType ? `Type: ${room.RoomType}` : null
            ].filter(Boolean).join(' | ');

            // Get first image from conferenceImages
            const images = room.ConferenceImage;

            // Get first image for single image field
            const image = room.ConferenceImage;

            return {
                id: index + 1, // Generate sequential ID
                image:room.ConferenceImages,
                Propertyname:property.Propertyname ,
                name:room.HallName || 'N/A',
                address: `${property.Propertyaddress || 'N/A'}, ${property.City || 'N/A'}`,
                hallDetails: hallDetails || 'N/A',
                price: avgPrice,
                rating: 4.5, // Static default from sample
                reviews: 320, // Static default from sample
                availability: slotAvailability, // Number of available slots
                propertyType: room.RoomType || 'Py-Olliv', // Use RoomType or default
                // Extra fields from original format
                propertyCode: room.PropertyCode,
                slots: availableSlots.map(slot => ({
                    slotName: slot.slotName,
                    from: slot.from,
                    to: slot.to,
                    price: slot.price,
                    availability: slot.availability
                }))
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