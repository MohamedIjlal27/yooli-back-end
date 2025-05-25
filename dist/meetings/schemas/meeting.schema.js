"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MeetingSchema = exports.Meeting = exports.MeetingStatus = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
var MeetingStatus;
(function (MeetingStatus) {
    MeetingStatus["SCHEDULED"] = "scheduled";
    MeetingStatus["ACTIVE"] = "active";
    MeetingStatus["ENDED"] = "ended";
    MeetingStatus["CANCELLED"] = "cancelled";
})(MeetingStatus || (exports.MeetingStatus = MeetingStatus = {}));
let Meeting = class Meeting {
};
exports.Meeting = Meeting;
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Meeting.prototype, "title", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Meeting.prototype, "description", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Meeting.prototype, "date", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Meeting.prototype, "startTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], Meeting.prototype, "endTime", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: true }),
    __metadata("design:type", Boolean)
], Meeting.prototype, "videoEnabled", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: mongoose_2.Types.ObjectId, ref: 'User', required: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Meeting.prototype, "organizerId", void 0);
__decorate([
    (0, mongoose_1.Prop)([{ type: mongoose_2.Types.ObjectId, ref: 'User' }]),
    __metadata("design:type", Array)
], Meeting.prototype, "participantIds", void 0);
__decorate([
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Meeting.prototype, "link", void 0);
__decorate([
    (0, mongoose_1.Prop)({ type: String, enum: MeetingStatus, default: MeetingStatus.SCHEDULED }),
    __metadata("design:type", String)
], Meeting.prototype, "status", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Meeting.prototype, "createdAt", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: Date.now }),
    __metadata("design:type", Date)
], Meeting.prototype, "updatedAt", void 0);
exports.Meeting = Meeting = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], Meeting);
exports.MeetingSchema = mongoose_1.SchemaFactory.createForClass(Meeting);
//# sourceMappingURL=meeting.schema.js.map