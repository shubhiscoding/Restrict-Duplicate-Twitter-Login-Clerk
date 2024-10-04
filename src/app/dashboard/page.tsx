"use client";
import { useClerk, useUser } from '@clerk/nextjs'
import { useEffect, useState } from 'react'

const Dashboard = () => {
  const { user } = useUser()
  const clerk = useClerk()
  const [twitterStatus, setTwitterStatus] = useState<string | null>(null)

  useEffect(() => {
    if (user) {
      const externalAccount = user.externalAccounts.find(
        (p) => p.provider === 'x'
      )

      if (externalAccount) {
        if (externalAccount.verification) {
          setTwitterStatus(externalAccount.verification.status)
        }
      }
      if(externalAccount?.username){
            const checkUser = fetch('/api/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                xUsername: externalAccount.username,
                UserId: clerk.user?.id || '',
            }),
            }); 
            checkUser.then(async (res) => {
            if(res.status != 200){
                console.log("User found with matching Twitter account.");
                if (externalAccount.verification) {
                externalAccount.verification.status = "failed";
                setTwitterStatus(externalAccount.verification.status)
                }
            }
            }).catch((error) => {
            console.error('An error occurred:', error);
            });
        }
    }
  }, [user])

  const addTwitter = async () => {
    try {
      if (!clerk.user) {
        throw new Error('User is not authenticated');
      }
      const externalAccount = await clerk.user.createExternalAccount({
        strategy: 'oauth_x',
        redirectUrl: '/dashboard',
      })
      if (externalAccount.verification) {
        window.location.href = externalAccount.verification.externalVerificationRedirectURL?.toString() || '/';
      } else {
        throw new Error('Verification is null');
      }
      console.log("After redirect!!!!!!!!!");
      try {
        const checkUser = fetch('/api/auth', {
            method: 'GET',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify({
            xUsername: externalAccount.username,
            UserId: clerk.user.id,
            }),
        }); 
        if((await checkUser).status != 200){
            console.log("User found with matching Twitter account.");
            externalAccount.verification.status = "failed";
        }
      } catch (error) {
        console.error('An error occurred:', error);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  if (!user) {
    return <div>Please SignIn</div>
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Twitter Verification Status: {twitterStatus}</p>
        <button onClick={addTwitter}>
          Connect Twitter
        </button>
    </div>
  )
}

export default Dashboard
