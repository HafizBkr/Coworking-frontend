
export function canAccesDashboard(
    isLoggin:boolean,
    isPublicRoute:boolean
) {
    if(isLoggin && isPublicRoute){
        return true
    }else{
        return false
    }
}

export function shouldRedirectToLogin(
    isLoggin:boolean,
    isProtected:boolean
) {
    if(!isLoggin && isProtected){
        return true
    }else{
        return false
    }
}