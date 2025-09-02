'use client'
import { useState, useEffect } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface OverviewReverseProps {
    data: any[];
}

export const OverviewReverse: React.FC<OverviewReverseProps> = ({
    data
}) => {

    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return null;
    }
    return (
        <ResponsiveContainer className="visible lg:hidden" width="100%" height={350}>

            <BarChart data={data}>
                <CartesianGrid strokeDasharray="2 2" />
                <Tooltip />
                <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                />
                <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                />
                <Bar dataKey="total" fill="#3498db" radius={[2, 2, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
}