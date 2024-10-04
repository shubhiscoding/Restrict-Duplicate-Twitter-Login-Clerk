import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";
const Clerk = clerkClient;

async function findUserByTwitterId(providerUserId: string, userId: string) {
    try {
        const users = await Clerk.users.getUserList();
        console.log(`Looking for providerUserId: ${providerUserId}`);

        for (const user of users.data) {
            if(user.id == userId){
                console.log(user.id, userId +" --------------------------------------------------------------");
                continue;
            }
            const externalAccounts = user.externalAccounts || [];
            const twitterAccount = externalAccounts.find(account =>
                account.provider === 'oauth_x' && account.username === providerUserId
            );

            if (twitterAccount) {
                console.log("User found with matching Twitter account.", user);
                return user;
            }
        }

        console.log("No matching user found.");
        return null;
    } catch (error) {
        console.error('Error fetching users from Clerk:', error);
        throw new Error('Could not fetch users');
    }
}

export const POST = async (req: Request) => {
    const { xUsername, UserId} = await req.json();
    if(!xUsername || !UserId){
        return NextResponse.json({error: 'Missing X username or User Id'}, {status: 400});
    }
    const user = await findUserByTwitterId(xUsername, UserId);
    if(!user){
        return NextResponse.json({message: 'No user found'}, {status: 200});
    }
    return NextResponse.json({message: 'User found', user}, {status: 503});
};