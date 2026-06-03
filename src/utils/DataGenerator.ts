// ─── Why DataGenerator exists ─────────────────────────────────────────────────
// Tests that create data need unique values on every run.
// Hardcoded data causes test interference — test 1 creates a user,
// test 2 tries to create the same user, fails with "already exists".
// DataGenerator creates unique values using timestamps and random strings.

export class DataGenerator{

    //-- unique email------
    static uniqueEmail():string{
        const timestamp=Date.now();
        const random=Math.random().toString(36).substring(2,.7);
        return `${timestamp}_${random}@test.com`
    }

    //--unitue username ----
    static uniqusername(prefix:string='user'):string{
        const timestamp= Date.now();
        return `${prefix}_${timestamp}`;
    }

    // ─── Random string ─────────────────────────────────────────────────────────
    static randomString(length: number = 8): string {
        return Math.random().toString(36).substring(2, 2 + length);
    }

    // ─── Random number in range ────────────────────────────────────────────────
    static randomNumber(min: number = 1, max: number = 100): number {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
 // ─── Random post data ──────────────────────────────────────────────────────
    static randomPost(userId: number = 1) {
        return {
            userId,
            title: `Test Post ${this.randomString()}`,
            body: `Test body content ${this.randomString(16)}`,
        };
    }

    // ─── Timestamp string ──────────────────────────────────────────────────────
    static timestamp(): string {
        return new Date().toISOString().replace(/[:.]/g, '-');
    }



}