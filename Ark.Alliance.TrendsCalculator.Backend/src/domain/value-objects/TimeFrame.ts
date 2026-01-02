/**
 * Time Frame Value Object
 * 
 * @fileoverview Immutable value object representing a time frame
 * @module domain/value-objects/TimeFrame
 */

/**
 * Time Frame Value Object
 * 
 * @remarks
 * Immutable value object representing a time range for analysis
 */
export class TimeFrame {
    private constructor(
        public readonly startTime: Date,
        public readonly endTime: Date
    ) {
        this.validate();
    }

    private validate(): void {
        if (this.startTime >= this.endTime) {
            throw new Error('Start time must be before end time');
        }
    }

    /**
     * Create a time frame
     */
    static create(startTime: Date, endTime: Date): TimeFrame {
        return new TimeFrame(startTime, endTime);
    }

    /**
     * Create a time frame for last N seconds
     */
    static lastSeconds(seconds: number): TimeFrame {
        const endTime = new Date();
        const startTime = new Date(endTime.getTime() - seconds * 1000);
        return new TimeFrame(startTime, endTime);
    }

    /**
     * Create a time frame for last N minutes
     */
    static lastMinutes(minutes: number): TimeFrame {
        return TimeFrame.lastSeconds(minutes * 60);
    }

    /**
     * Get duration in milliseconds
     */
    getDurationMs(): number {
        return this.endTime.getTime() - this.startTime.getTime();
    }

    /**
     * Get duration in seconds
     */
    getDurationSeconds(): number {
        return this.getDurationMs() / 1000;
    }

    /**
     * Check if a timestamp is within this time frame
     */
    contains(timestamp: Date): boolean {
        return timestamp >= this.startTime && timestamp <= this.endTime;
    }
}
