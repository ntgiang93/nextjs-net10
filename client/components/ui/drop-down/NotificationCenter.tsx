import {
    Badge,
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownSection,
    DropdownTrigger,
    Link
} from "@heroui/react";
import {AlertCircleIcon, Notification02Icon} from "hugeicons-react";
import {MOCK_NOTI} from "@/model/data/noti";
import {TimeHelper} from "@/libs/TimeHelper";

export const NotificationCenter = () => {
    const unreadCount = MOCK_NOTI.filter(x => !x.isRead).length
    return (
        <Dropdown placement="bottom-end" showArrow>
            <DropdownTrigger>
                <Button color="default" variant="light" radius={'full'}
                        className={'text-default-600'} isIconOnly>
                    <Badge color="primary" content={unreadCount > 0 ? unreadCount : ''}>
                        <Notification02Icon size={18}/>
                    </Badge>
                </Button>
            </DropdownTrigger>
            <DropdownMenu aria-label="Profile Actions" variant="flat">
                <DropdownSection showDivider aria-label="Profile & Actions">
                    <DropdownItem key="profile" isReadOnly classNames={{base:[
                            "data-[hover=true]:bg-transparent",
                        ] }}>
                        <div className="flex justify-between">
                            <p className="font-bold text-xl">Thông báo</p>
                            <Link color="primary" href="#" onPress={() => {
                            }}>
                                Đánh dấu tất cả là đã đọc
                            </Link>
                        </div>
                    </DropdownItem>
                </DropdownSection>

                <DropdownSection aria-label="Preferences">
                    {MOCK_NOTI.map((item) =>
                        (
                            <DropdownItem
                                key={item.id}
                                classNames={{
                                    title: `font-semibold w-full ${item.isRead ? 'text-default' : ''}`,
                                }}
                                startContent={
                                    <span
                                        className={`${item.isRead ? 'text-default' : ''}`}><AlertCircleIcon
                                        size={24}/></span>
                                }
                                title={
                                    <div className={'flex justify-between gap-2'}>
                                        <span>{item.title}</span>
                                        {!item.isRead &&
                                            <Badge color="primary" content="" classNames={{badge: 'top-1.5 right-1.5'}}>
                                                <span></span>
                                            </Badge>}
                                    </div>
                                }
                                description={<div className={'flex justify-between gap-2'}>
                                    <span>{item.message}</span>
                                    <span>{TimeHelper.DateDiffToString(new Date(item.createdAt), new Date(), 'round')}</span>
                                </div>}
                            >
                            </DropdownItem>
                        ))}
                </DropdownSection>
            </DropdownMenu>
        </Dropdown>
    );
};