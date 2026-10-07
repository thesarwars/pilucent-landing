'use server'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
 
export async function SetCookies(token: string,companyUid?:string) {
  const oneDayInMilliseconds = 24 * 60 * 60 * 1000; // 1 day
  // const oneDayInMilliseconds = 2 * 60 * 1000;; // test
  const expires = new Date(Date.now() + oneDayInMilliseconds); 
  (await cookies()).set({
    name: 'token',
    value: token,
    httpOnly: true,
    path: '/',
    expires, 
  });
  if(companyUid){
    (await cookies()).set({
      name: 'company_uid',
      value: companyUid,
      httpOnly: true,
      path: '/',
      expires, 
    });
  }

}
 export async function GetCookies() {
    const cookieStore = await cookies()
  const uid = cookieStore.get('token')
  if(uid?.value){
    return uid.value;
  }
  else{
    return null;
  }
}
 export async function GetCompanyCookies() {
    const cookieStore = await cookies()
  const company_uid = cookieStore.get('company_uid')
  if(company_uid?.value){
    return company_uid.value;
  }
  else{
    return null;
  }
}
export async function DeleteCookies() {
    const cookieStore = await cookies();
    cookieStore.delete('token'); // Specify path if needed
    cookieStore.delete('company_uid'); // Specify path if needed
    revalidatePath('/'); // Update cached posts
    redirect('/auth/signin'); // Navigate to the new post page
  }